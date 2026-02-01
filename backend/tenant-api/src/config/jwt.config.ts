/**
 * JWT Configuration
 * 
 * Configuration for JSON Web Token authentication.
 */

import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (
    configService: ConfigService,
): JwtModuleOptions => {
    return {
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
            issuer: 'humanitas-erp',
            audience: 'humanitas-tenant-api',
        },
        verifyOptions: {
            issuer: 'humanitas-erp',
            audience: 'humanitas-tenant-api',
        },
    };
};

/**
 * Refresh token configuration
 */
export const getRefreshTokenConfig = (
    configService: ConfigService,
): JwtModuleOptions => {
    return {
        secret: configService.get<string>('JWT_REFRESH_SECRET'),
        signOptions: {
            expiresIn: configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
            issuer: 'humanitas-erp',
            audience: 'humanitas-tenant-api',
        },
    };
};
