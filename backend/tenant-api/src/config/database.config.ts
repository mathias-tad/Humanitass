/**
 * Database Configuration
 * 
 * Configures TypeORM connection for the application.
 */

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
    configService: ConfigService,
): TypeOrmModuleOptions => {
    return {
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME', 'humanitas_master'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Disable in production!
        logging: configService.get<string>('NODE_ENV') === 'development',
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        migrationsRun: true,
        ssl: configService.get<string>('DB_SSL') === 'true' ? {
            rejectUnauthorized: false
        } : false,
    };
};

/**
 * Multi-tenant database configuration
 * 
 * Returns configuration for a specific tenant database
 */
export const getTenantDatabaseConfig = (
    tenantSlug: string,
    configService: ConfigService,
): TypeOrmModuleOptions => {
    return {
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD'),
        database: `tenant_${tenantSlug}`,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // Never auto-sync tenant databases
        logging: false,
    };
};
