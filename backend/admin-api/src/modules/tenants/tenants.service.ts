import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

/**
 * Tenants Service (Admin API)
 * 
 * Handles tenant provisioning and management.
 * This is the core service for the multi-tenant architecture.
 * 
 * Key Responsibilities:
 * - Create and configure new tenant databases
 * - Initialize database schemas
 * - Manage tenant lifecycle
 * - Track tenant metrics
 */
@Injectable()
export class TenantsService {
    constructor(
        @InjectRepository(Tenant)
        private tenantsRepository: Repository<Tenant>,
        private masterDataSource: DataSource, // Master database connection
    ) { }

    /**
     * Create new tenant with dedicated database
     * 
     * This is the most critical operation in the multi-tenant system.
     * 
     * Process:
     * 1. Validate tenant slug (unique subdomain)
     * 2. Create tenant record in master database
     * 3. Create new PostgreSQL database
     * 4. Run migrations on tenant database
     * 5. Seed default data
     * 6. Create initial admin user
     * 
     * @param createTenantDto - Tenant details
     * @returns Created tenant
     */
    async createTenant(createTenantDto: CreateTenantDto): Promise<Tenant> {
        const { company_name, slug, admin_email, admin_name } = createTenantDto;

        // Step 1: Check if slug is already taken
        const existingTenant = await this.tenantsRepository.findOne({
            where: { slug },
        });

        if (existingTenant) {
            throw new ConflictException(`Tenant with slug '${slug}' already exists`);
        }

        // Step 2: Create tenant record
        const tenant = this.tenantsRepository.create({
            company_name,
            slug,
            database_name: `tenant_${slug}`,
            subscription_status: 'trial', // 14-day trial
            subscription_plan: 'basic',
            max_users: 50, // Trial limit
            is_active: true,
        });

        await this.tenantsRepository.save(tenant);

        try {
            // Step 3: Create dedicated PostgreSQL database
            await this.createTenantDatabase(tenant.database_name);

            // Step 4: Initialize schema
            await this.initializeTenantSchema(tenant.database_name);

            // Step 5: Seed default data
            await this.seedTenantData(tenant.database_name, {
                admin_email,
                admin_name,
                company_name,
            });

            console.log(`✅ Tenant '${slug}' created successfully!`);
            console.log(`📊 Database: ${tenant.database_name}`);
            console.log(`👤 Admin: ${admin_email}`);

            return tenant;
        } catch (error) {
            // Rollback: Delete tenant record if database creation fails
            await this.tenantsRepository.delete(tenant.id);
            throw error;
        }
    }

    /**
     * Create PostgreSQL database for tenant
     * 
     * @param databaseName - Name of the database to create
     */
    private async createTenantDatabase(databaseName: string): Promise<void> {
        try {
            // Create database using raw SQL
            await this.masterDataSource.query(
                `CREATE DATABASE ${databaseName} 
         WITH OWNER = postgres 
         ENCODING = 'UTF8' 
         CONNECTION LIMIT = 100;`
            );

            console.log(`✅ Database '${databaseName}' created`);
        } catch (error) {
            console.error(`❌ Failed to create database: ${error.message}`);
            throw new Error(`Database creation failed: ${error.message}`);
        }
    }

    /**
     * Initialize tenant database schema
     * 
     * Runs TypeORM migrations to create all tables:
     * - users
     * - employees
     * - departments
     * - attendance
     * - payroll
     * - leaves
     * - performance (KPIs, goals)
     * - settings
     * 
     * @param databaseName - Tenant database name
     */
    private async initializeTenantSchema(databaseName: string): Promise<void> {
        // Create new connection to tenant database
        const tenantConnection = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: databaseName,
            entities: ['./tenant-entities/**/*.entity.ts'], // Tenant entities
            synchronize: true, // Auto-create schema (only for new tenants)
        });

        await tenantConnection.initialize();

        console.log(`✅ Schema initialized for '${databaseName}'`);

        await tenantConnection.destroy();
    }

    /**
     * Seed default data for new tenant
     * 
     * Creates:
     * - Admin user
     * - Default employee categories
     * - Default leave types
     * - System settings
     * 
     * @param databaseName - Tenant database
     * @param adminData - Admin user info
     */
    private async seedTenantData(
        databaseName: string,
        adminData: { admin_email: string; admin_name: string; company_name: string }
    ): Promise<void> {
        const tenantConnection = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: databaseName,
        });

        await tenantConnection.initialize();

        // Create admin user
        await tenantConnection.query(`
      INSERT INTO users (email, full_name, role, is_active, is_password_set)
      VALUES ($1, $2, 'admin', true, false)
    `, [adminData.admin_email, adminData.admin_name]);

        // Create default employee categories
        await tenantConnection.query(`
      INSERT INTO employee_categories (name, description)
      VALUES 
        ('Management', 'Management level employees'),
        ('Field', 'Field level employees'),
        ('General', 'General employees')
    `);

        // Create default leave types
        await tenantConnection.query(`
      INSERT INTO leave_types (name, days_per_year, requires_approval)
      VALUES 
        ('Annual Leave', 20, true),
        ('Sick Leave', 10, false),
        ('Personal Leave', 5, true)
    `);

        console.log(`✅ Default data seeded for '${databaseName}'`);

        await tenantConnection.destroy();
    }

    /**
     * Get all tenants
     */
    async findAll(): Promise<Tenant[]> {
        return this.tenantsRepository.find({
            order: { created_at: 'DESC' },
        });
    }

    /**
     * Get tenant by ID
     */
    async findOne(id: string): Promise<Tenant> {
        const tenant = await this.tenantsRepository.findOne({ where: { id } });

        if (!tenant) {
            throw new NotFoundException(`Tenant with ID ${id} not found`);
        }

        return tenant;
    }

    /**
     * Get tenant statistics
     */
    async getStatistics(tenantId: string): Promise<any> {
        const tenant = await this.findOne(tenantId);

        // Connect to tenant database and fetch stats
        const tenantConnection = new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: tenant.database_name,
        });

        await tenantConnection.initialize();

        const [userCount] = await tenantConnection.query(
            'SELECT COUNT(*) as count FROM users'
        );
        const [employeeCount] = await tenantConnection.query(
            'SELECT COUNT(*) as count FROM users WHERE is_active = true'
        );

        await tenantConnection.destroy();

        return {
            tenant_id: tenant.id,
            company_name: tenant.company_name,
            total_users: parseInt(userCount.count),
            active_employees: parseInt(employeeCount.count),
            subscription_status: tenant.subscription_status,
            database_size_mb: 0, // TODO: Calculate actual size
        };
    }

    /**
     * Suspend tenant
     */
    async suspendTenant(id: string): Promise<{ message: string }> {
        const tenant = await this.findOne(id);
        tenant.is_active = false;
        tenant.subscription_status = 'suspended';
        await this.tenantsRepository.save(tenant);

        return { message: `Tenant '${tenant.slug}' suspended successfully` };
    }

    /**
     * Reactivate tenant
     */
    async reactivateTenant(id: string): Promise<{ message: string }> {
        const tenant = await this.findOne(id);
        tenant.is_active = true;
        tenant.subscription_status = 'active';
        await this.tenantsRepository.save(tenant);

        return { message: `Tenant '${tenant.slug}' reactivated successfully` };
    }

    /**
     * Permanently delete tenant and database
     * 
     * ⚠️ DANGER: This is irreversible!
     */
    async deleteTenantPermanently(id: string): Promise<{ message: string }> {
        const tenant = await this.findOne(id);

        // Drop tenant database
        await this.masterDataSource.query(
            `DROP DATABASE IF EXISTS ${tenant.database_name};`
        );

        // Delete tenant record
        await this.tenantsRepository.delete(id);

        console.log(`🗑️ Tenant '${tenant.slug}' and database deleted permanently`);

        return { message: `Tenant '${tenant.slug}' deleted permanently` };
    }
}
