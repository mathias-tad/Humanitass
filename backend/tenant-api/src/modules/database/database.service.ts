import { Injectable, OnModuleDestroy, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * DatabaseService - Multi-Tenant Connection Management
 * 
 * This service implements the core of Humanitas' database-per-tenant architecture.
 * It manages dynamic tenant database connections, connection pooling, and tenant isolation.
 * 
 * Key Features:
 * - Connection pooling per tenant database
 * - URL parsing for cloud database services (Render, Supabase, etc.)
 * - Automatic SSL configuration
 * - Graceful connection cleanup
 * - Tenant provisioning automation
 */
@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private connections: Map<string, DataSource> = new Map();
    private readonly MAX_CONNECTIONS_PER_TENANT = 20;

    constructor(
        private readonly configService: ConfigService,
        @InjectDataSource() private readonly masterDataSource: DataSource,
    ) { }

    /**
     * Parse DATABASE_URL connection string
     * Supports cloud providers like Render, Supabase, AWS RDS
    **/
    private parseDatabaseUrl(url: string) {
        try {
            const parsed = new URL(url);
            return {
                host: parsed.hostname,
                port: parseInt(parsed.port || '5432'),
                username: parsed.username,
                password: parsed.password,
            };
        } catch (e) {
            console.warn('Invalid DATABASE_URL, falling back to env vars');
            return {};
        }
    }

    /**
     * Get or create a connection to a specific tenant's database
     * 
     * @param databaseName - The name of the tenant's database (e.g., tenant_acme)
     * @returns DataSource connection with connection pooling enabled
     */
    async getTenantConnection(databaseName: string): Promise<DataSource> {
        console.log(`🔍 Getting tenant connection for database: ${databaseName}`);

        // Check if connection already exists and is initialized
        const existingConnection = this.connections.get(databaseName);
        if (existingConnection && existingConnection.isInitialized) {
            console.log(`✅ Using cached connection for database: ${databaseName}`);
            return existingConnection;
        }

        // Parse connection credentials from DATABASE_URL or env variables
        const dbUrl = this.configService.get<string>('DATABASE_URL');
        const sslEnabled = this.configService.get<string>('DATABASE_SSL') === 'true';

        const connectionOptions: DataSourceOptions = {
            type: 'postgres',
            // Flexible connection: URL or individual env variables
            ...(dbUrl
                ? this.parseDatabaseUrl(dbUrl)
                : {
                    host: this.configService.get<string>('DATABASE_HOST'),
                    port: this.configService.get<number>('DATABASE_PORT', 5432),
                    username: this.configService.get<string>('DATABASE_USERNAME'),
                    password: this.configService.get<string>('DATABASE_PASSWORD'),
                }),
            database: databaseName, // Override with tenant-specific database
            entities: [/* All tenant entities here */],
            synchronize: false, // NEVER in production - use migrations
            logging: this.configService.get<string>('NODE_ENV') === 'development',

            // Connection Pooling Configuration
            extra: {
                max: this.MAX_CONNECTIONS_PER_TENANT, // Maximum connections
                min: 2,                                // Minimum connections
                idleTimeoutMillis: 30000,             // Close idle connections
                connectionTimeoutMillis: 5000,        // Connection timeout
            },

            // SSL Configuration
            // Force SSL for cloud databases, disable for localhost
            ssl:
                dbUrl && (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1'))
                    ? false
                    : sslEnabled
                        ? { rejectUnauthorized: false }
                        : false,
        };

        console.log(`[DatabaseService] Creating connection to: ${databaseName}`);

        try {
            const dataSource = new DataSource(connectionOptions);
            await dataSource.initialize();

            // Cache the connection for reuse
            this.connections.set(databaseName, dataSource);

            console.log(`✅ Connected to tenant database: ${databaseName}`);
            return dataSource;
        } catch (error) {
            console.error(
                `❌ Failed to connect to tenant database ${databaseName}:`,
                error.message,
            );
            throw error;
        }
    }

    /**
     * Get tenant connection by tenant ID
     * Looks up the database name from the master database
     * 
     * @param tenantId - UUID of the tenant
     * @returns DataSource for tenant's database
     */
    async getTenantConnectionById(tenantId: string): Promise<DataSource> {
        // Query master database for tenant's database name
        const result = await this.masterDataSource.query(
            `SELECT database_name FROM tenants WHERE id = $1`,
            [tenantId],
        );

        if (result.length === 0) {
            throw new NotFoundException(`Tenant not found: ${tenantId}`);
        }

        return this.getTenantConnection(result[0].database_name);
    }

    /**
     * Get all tenants from master database
     * Used for batch operations across all tenants
     */
    async getAllTenants(): Promise<
        Array<{ id: string; slug: string; database_name: string }>
    > {
        const result = await this.masterDataSource.query(
            `SELECT id, slug, database_name FROM tenants WHERE status = 'active'`,
        );
        return result || [];
    }

    /**
     * Create a new tenant database
     * This is called during tenant provisioning/registration
     * 
     * @param databaseName - Name for the new database
     */
    async createTenantDatabase(databaseName: string): Promise<void> {
        console.log(`🔧 Creating tenant database: ${databaseName}`);

        const dbUrl = this.configService.get<string>('DATABASE_URL');
        const sslEnabled = this.configService.get<string>('DATABASE_SSL') === 'true';

        // Parse credentials
        const { host, port  username, password } = dbUrl
            ? this.parseDatabaseUrl(dbUrl)
            : {
                host: this.configService.get<string>('DATABASE_HOST'),
                port: this.configService.get<number>('DATABASE_PORT', 5432),
                username: this.configService.get<string>('DATABASE_USERNAME'),
                password: this.configService.get<string>('DATABASE_PASSWORD'),
            };

        // Connect to 'postgres' database to create new database
        const adminOptions: DataSourceOptions = {
            type: 'postgres',
            host,
            port,
            username,
            password,
            database: 'postgres', // Default PostgreSQL database
            ssl:
                dbUrl && (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1'))
                    ? false
                    : sslEnabled
                        ? { rejectUnauthorized: false }
                        : false,
        };

        const adminConnection = new DataSource(adminOptions);

        try {
            await adminConnection.initialize();
            console.log(`📊 Connected to postgres for admin operations`);

            // Check if database already exists
            const result = await adminConnection.query(
                `SELECT 1 FROM pg_database WHERE datname = $1`,
                [databaseName],
            );

            if (result.length === 0) {
                // Create new database
                await adminConnection.query(`CREATE DATABASE "${databaseName}"`);
                console.log(`✅ Database ${databaseName} created`);
            } else {
                console.log(`ℹ️ Database ${databaseName} already exists`);
            }

            await adminConnection.destroy();

            // Initialize schema in the new database
            await this.initializeTenantSchema(databaseName);
        } catch (error) {
            console.error(
                `❌ Failed to create database ${databaseName}:`,
                error.message,
            );
            if (adminConnection.isInitialized) {
                await adminConnection.destroy();
            }
            throw error;
        }
    }

    /**
     * Initialize schema for a new tenant database
     * Creates all necessary tables, indexes, and seed data
     * 
     * @param databaseName - Name of the tenant database
     */
    private async initializeTenantSchema(databaseName: string): Promise<void> {
        console.log(`📝 Initializing schema in database: ${databaseName}`);

        const connection = await this.getTenantConnection(databaseName);

        try {
            // Create core tables
            await connection.query(`
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255),
          full_name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          role VARCHAR(50) DEFAULT 'employee',
          department VARCHAR(100),
          position VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Departments table
        CREATE TABLE IF NOT EXISTS departments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          description TEXT,
          manager_id UUID REFERENCES users(id),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Settings table (JSONB for flexibility)
        CREATE TABLE IF NOT EXISTS settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category VARCHAR(50) NOT NULL UNIQUE,
          data JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes for performance
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
        CREATE INDEX IF NOT EXISTS idx_departments_manager ON departments(manager_id);
      `);

            console.log(`✅ Schema initialized for database: ${databaseName}`);
        } catch (error) {
            console.error(`❌ Failed to initialize schema: ${error.message}`);
            throw error;
        }
    }

    /**
     * Reset a specific database connection
     * Useful for connection issues or schema updates
     * 
     * @param databaseName - Name of the database to reset
     */
    async resetConnection(databaseName: string): Promise<void> {
        const connection = this.connections.get(databaseName);
        if (connection) {
            if (connection.isInitialized) {
                await connection.destroy();
            }
            this.connections.delete(databaseName);
            console.log(`♻️ Reset connection for database: ${databaseName}`);
        }
    }

    /**
     * Cleanup: Close all connections when module is destroyed
     */
    async onModuleDestroy() {
        console.log('🧹 Closing all database connections...');

        for (const [dbName, connection] of this.connections.entries()) {
            try {
                if (connection.isInitialized) {
                    await connection.destroy();
                    console.log(`✅ Closed connection to: ${dbName}`);
                }
            } catch (error) {
                console.error(`❌ Error closing connection to ${dbName}:`, error.message);
            }
        }

        this.connections.clear();
        console.log('✅ All connections closed');
    }
}
