import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom Decorators for Humanitas ERP
 * 
 * These decorators simplify common patterns and improve code readability.
 * They extract context from the request and inject it into route handlers.
 */

/**
 * @CurrentUser Decorator
 * 
 * Extracts authenticated user from request.
 * 
 * Usage:
 * @Get('profile')
 * getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);

/**
 * @TenantId Decorator
 * 
 * Extracts tenant ID from authenticated user.
 * 
 * Usage:
 * @Get('employees')
 * getEmployees(@TenantId() tenantId: string) {
 *   return this.service.findAll(tenantId);
 * }
 */
export const TenantId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.tenantId;
    },
);

/**
 * @TenantSlug Decorator
 * 
 * Extracts tenant slug from request.
 * 
 * Usage:
 * @Post('login')
 * login(@TenantSlug() tenantSlug: string, @Body() dto: LoginDto) {
 *   return this.authService.login(tenantSlug, dto);
 * }
 */
export const TenantSlug = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.tenantSlug || request.user?.tenantSlug;
    },
);

/**
 * @UserId Decorator
 * 
 * Extracts user ID from authenticated user.
 * 
 * Usage:
 * @Get('my-profile')
 * getMyProfile(@UserId() userId: string) {
 *   return this.service.findOne(userId);
 * }
 */
export const UserId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.sub || request.user?.id;
    },
);

/**
 * @UserRole Decorator
 * 
 * Extracts user role from authenticated user.
 * 
 * Usage:
 * @Get('admin-panel')
 * @Roles('admin')
 * getAdminPanel(@UserRole() role: string) {
 *   console.log(`User role: ${role}`);
 * }
 */
export const UserRole = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.user?.role;
    },
);

/**
 * @Pagination Decorator
 * 
 * Extracts and validates pagination parameters.
 * 
 * Usage:
 * @Get('users')
 * getUsers(@Pagination() pagination: PaginationParams) {
 *   const { page, limit, skip } = pagination;
 *   return this.service.findAll(skip, limit);
 * }
 */
export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

export const Pagination = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): PaginationParams => {
        const request = ctx.switchToHttp().getRequest();
        const page = parseInt(request.query.page) || 1;
        const limit = Math.min(parseInt(request.query.limit) || 10, 100); // Max 100

        return {
            page,
            limit,
            skip: (page - 1) * limit,
        };
    },
);

/**
 * @IpAddress Decorator
 * 
 * Extracts client IP address from request.
 * Handles proxies and load balancers.
 * 
 * Usage:
 * @Post('login')
 * login(@IpAddress() ip: string) {
 *   console.log(`Login attempt from: ${ip}`);
 * }
 */
export const IpAddress = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();

        return (
            request.headers['x-forwarded-for']?.split(',')[0] ||
            request.headers['x-real-ip'] ||
            request.connection.remoteAddress ||
            request.ip ||
            'unknown'
        );
    },
);

/**
 * @UserAgent Decorator
 * 
 * Extracts user agent from request headers.
 * 
 * Usage:
 * @Post('login')
 * login(@UserAgent() userAgent: string) {
 *   console.log(`User agent: ${userAgent}`);
 * }
 */
export const UserAgent = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest();
        return request.headers['user-agent'] || 'unknown';
    },
);

/**
 * Example: Using multiple decorators together
 * 
 * @Post('payroll/run')
 * @UseGuards(JwtAuthGuard, TenantGuard)
 * async runPayroll(
 *   @TenantId() tenantId: string,
 *   @UserId() userId: string,
 *   @UserRole() role: string,
 *   @IpAddress() ip: string,
 *   @Body() dto: RunPayrollDto,
 * ) {
 *   // Log audit trail
 *   await this.auditService.log({
 *     tenantId,
 *     userId,
 *     action: 'PAYROLL_RUN',
 *     ipAddress: ip,
 *     role,
 *   });
 *   
 *   return this.payrollService.runPayroll(tenantId, dto);
 * }
 */
