import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JWT Authentication Guard
 * 
 * Validates JWT tokens and extracts user information.
 * Supports both Authorization header and HTTP-only cookies.
 * 
 * Key Features:
 * - Multi-source token extraction (header + cookies)
 * - Tenant context injection into request
 * - Automatic token validation
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard)
 * @Get('protected-route')
 * getProtectedData(@Request() req) {
 *   const userId = req.user.sub;
 *   const tenantId = req.user.tenantId;
 * }
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    /**
     * Validates the request and injects user context
     * 
     * @param context - Execution context containing request
     * @returns true if authenticated, throws UnauthorizedException if not
     */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // Extract token from multiple sources
        const token = this.extractTokenFromRequest(request);

        if (!token) {
            throw new UnauthorizedException('No authentication token provided');
        }

        try {
            // Verify and decode JWT
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            // Inject user payload into request object
            // Available in controllers as: req.user
            request.user = payload;

            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    /**
     * Extract JWT token from request
     * Checks both Authorization header and cookies
     * 
     * Priority:
     * 1. Authorization header (Bearer token)
     * 2. access_token cookie
     * 
     * @param request - HTTP request object
     * @returns JWT token string or undefined
     */
    private extractTokenFromRequest(request: any): string | undefined {
        // Try Authorization header first
        const authHeader = request.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        // Fall back to cookies
        return request.cookies?.access_token;
    }
}

/**
 * Tenant Guard
 * 
 * Ensures user can only access their own tenant's data.
 * Works in conjunction with JwtAuthGuard.
 * 
 * Validates:
 * - User belongs to a specific tenant
 * - Request is for the correct tenant database
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard, TenantGuard)
 * @Get('employees')
 * getEmployees(@Request() req) {
 *   // req.tenantId automatically set
 *   // Can only see employees from OWN tenant
 * }
 */
@Injectable()
export class TenantGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.tenantId) {
            throw new UnauthorizedException('User is not associated with a tenant');
        }

        // Inject tenantId into request for easy access
        request.tenantId = user.tenantId;
        request.tenantSlug = user.tenantSlug;

        return true;
    }
}
