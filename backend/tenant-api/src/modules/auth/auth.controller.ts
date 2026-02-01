import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    Res,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TenantLoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Authentication Controller
 * 
 * Handles user authentication, JWT token management, and session control.
 * Implements secure authentication patterns with HTTP-only cookies and token refresh.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Cookie configuration for secure token storage
     * Uses HTTP-only cookies to prevent XSS attacks
     */
    private getCookieOptions(maxAgeSeconds: number) {
        const isProduction = process.env.NODE_ENV === 'production';

        return {
            httpOnly: true,              // Prevent JavaScript access
            secure: isProduction,        // HTTPS only in production
            sameSite: 'lax' as const,   // CSRF protection
            path: '/',
            maxAge: maxAgeSeconds,
        };
    }

    /**
     * User Login
     * 
     * Authenticates user and returns JWT tokens.
     * Stores tokens in HTTP-only cookies for security.
     * 
     * @param loginDto - Contains organization ID, email, and password
     * @returns User info, tenant info, and authentication tokens
     */
    @Post('login')
    @ApiOperation({ summary: 'Login as tenant user' })
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: TenantLoginDto,
        @Res({ passthrough: true }) response: any,
    ) {
        const result = await this.authService.login(loginDto);

        // Set secure HTTP-only cookies
        response.setCookie(
            'access_token',
            result.access_token,
            this.getCookieOptions(6 * 60 * 60), // 6 hours
        );
        response.setCookie(
            'refresh_token',
            result.refresh_token,
            this.getCookieOptions(7 * 24 * 60 * 60), // 7 days
        );

        return {
            access_token: result.access_token,
            refresh_token: result.refresh_token,
            user: result.user,
            tenant: result.tenant,
        };
    }

    /**
     * Get Tenant Information
     * 
     * Public endpoint to retrieve tenant details by slug.
     * Used during login to validate organization ID.
     * 
     * @param slug - Tenant's unique slug/organization ID
     * @returns Tenant information (name, logo, settings)
     */
    @Get('tenant/:slug')
    @ApiOperation({ summary: 'Get tenant info by slug' })
    async getTenantBySlug(@Param('slug') slug: string) {
        return this.authService.getTenantBySlug(slug);
    }

    /**
     * Refresh Access Token
     * 
     * Generates new access token using refresh token.
     * Implements token rotation for enhanced security.
     * 
     * @returns New access and refresh tokens
     */
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @Request() req: any,
        @Res({ passthrough: true }) response: any,
    ) {
        // Read refresh token from HTTP-only cookie
        const refreshToken = req.cookies?.refresh_token;

        if (!refreshToken) {
            response.status(HttpStatus.UNAUTHORIZED);
            return { message: 'No refresh token provided' };
        }

        const result = await this.authService.refreshToken(refreshToken);

        // Set new cookies with updated tokens
        response.setCookie(
            'access_token',
            result.access_token,
            this.getCookieOptions(6 * 60 * 60),
        );
        response.setCookie(
            'refresh_token',
            result.refresh_token,
            this.getCookieOptions(7 * 24 * 60 * 60),
        );

        return { message: 'Token refreshed successfully' };
    }

    /**
     * User Logout
     * 
     * Clears authentication cookies and invalidates refresh token.
     * 
     * @returns Success message
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout user' })
    async logout(
        @Request() req: any,
        @Res({ passthrough: true }) response: any,
    ) {
        // Clear cookies
        response.clearCookie('access_token', { path: '/' });
        response.clearCookie('refresh_token', { path: '/' });

        // Invalidate refresh token on backend
        if (req.user?.sub && req.user?.tenantId) {
            await this.authService.logout(req.user.sub, req.user.tenantId);
        }

        return { message: 'Logged out successfully' };
    }

    /**
     * Get Current User (Protected Route)
     * 
     * Returns authenticated user's information.
     * Requires valid JWT token.
     * 
     * @returns Current user details
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user info' })
    getCurrentUser(@Request() req: any) {
        return {
            id: req.user.sub,
            email: req.user.email,
            tenantId: req.user.tenantId,
            tenantSlug: req.user.tenantSlug,
            role: req.user.role,
        };
    }

    /**
     * Get WebSocket Token
     * 
     * Generates token for WebSocket authentication.
     * Used for real-time features (presence, notifications).
     * 
     * @returns WebSocket authentication token
     */
    @Get('ws-token')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get WebSocket authentication token' })
    async getWebSocketToken(@Request() req: any) {
        const token =
            req.cookies?.access_token ||
            req.headers.authorization?.replace('Bearer ', '');

        return {
            token,
            expiresIn: 3600, // 1 hour
        };
    }
}
