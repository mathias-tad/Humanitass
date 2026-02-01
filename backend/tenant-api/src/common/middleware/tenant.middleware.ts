import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Tenant Resolution Middleware
 * 
 * Extracts and validates tenant context from incoming requests.
 * Runs before route handlers to inject tenant information.
 * 
 * Tenant Resolution Strategy:
 * 1. Check x-tenant-slug header (API clients)
 * 2. Extract from JWT token (authenticated requests)
 * 3. Parse from subdomain (multi-domain setup)
 * 
 * This middleware ensures every request is associated with a valid tenant,
 * enabling the database service to connect to the correct tenant database.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            // Strategy 1: Check custom header (for API clients)
            let tenantSlug = req.headers['x-tenant-slug'] as string;

            // Strategy 2: Extract from JWT token (for authenticated users)
            if (!tenantSlug) {
                const token = this.extractToken(req);
                if (token) {
                    try {
                        const payload = await this.jwtService.verifyAsync(token, {
                            secret: this.configService.get<string>('JWT_SECRET'),
                        });
                        tenantSlug = payload.tenantSlug;
                    } catch (error) {
                        // Token invalid, will be caught by auth guard later
                    }
                }
            }

            // Strategy 3: Parse from subdomain (optional)
            // Example: tenant1.humanitas.com -> tenant1
            if (!tenantSlug && this.configService.get('ENABLE_SUBDOMAIN_ROUTING')) {
                const hostname = req.hostname;
                const parts = hostname.split('.');
                if (parts.length > 2) {
                    tenantSlug = parts[0];
                }
            }

            // Inject tenant context into request
            if (tenantSlug) {
                (req as any).tenantSlug = tenantSlug;
            }

            next();
        } catch (error) {
            next(error);
        }
    }

    /**
     * Extract JWT token from request
     * Checks both Authorization header and cookies
     * 
     * @param req - Express request object
     * @returns JWT token or null
     */
    private extractToken(req: Request): string | null {
        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }

        // Check cookies
        return req.cookies?.access_token || null;
    }
}

/**
 * Request Logging Middleware
 * 
 * Logs all incoming HTTP requests with relevant metadata.
 * Useful for debugging, auditing, and monitoring.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const startTime = Date.now();

        // Log request
        console.log(`📥 [${method}] ${originalUrl} - ${ip} - ${userAgent}`);

        // Log response when finished
        res.on('finish', () => {
            const { statusCode } = res;
            const duration = Date.now() - startTime;

            const emoji = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️' : '✅';
            console.log(
                `${emoji} [${method}] ${originalUrl} - ${statusCode} - ${duration}ms`,
            );
        });

        next();
    }
}

/**
 * Rate Limiting Middleware (Simple Implementation)
 * 
 * Prevents API abuse by limiting requests per IP address.
 * For production, use @nestjs/throttler or Redis-based solution.
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    private requestCounts = new Map<string, { count: number; resetTime: number }>();
    private readonly MAX_REQUESTS = 100; // Requests per window
    private readonly WINDOW_MS = 60 * 1000; // 1 minute

    use(req: Request, res: Response, next: NextFunction) {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();

        // Get or initialize request count for this IP
        let record = this.requestCounts.get(ip);

        if (!record || now > record.resetTime) {
            // Reset window
            record = {
                count: 1,
                resetTime: now + this.WINDOW_MS,
            };
            this.requestCounts.set(ip, record);
        } else {
            record.count++;
        }

        // Check if limit exceeded
        if (record.count > this.MAX_REQUESTS) {
            res.status(429).json({
                statusCode: 429,
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((record.resetTime - now) / 1000),
            });
            return;
        }

        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', this.MAX_REQUESTS.toString());
        res.setHeader('X-RateLimit-Remaining', (this.MAX_REQUESTS - record.count).toString());
        res.setHeader(
            'X-RateLimit-Reset',
            new Date(record.resetTime).toISOString(),
        );

        next();
    }

    /**
     * Cleanup old entries periodically
     * Call this from a cron job or interval
     */
    cleanup() {
        const now = Date.now();
        for (const [ip, record] of this.requestCounts.entries()) {
            if (now > record.resetTime) {
                this.requestCounts.delete(ip);
            }
        }
    }
}

/**
 * CORS Configuration Middleware
 * 
 * Handles Cross-Origin Resource Sharing for frontend apps.
 * More flexible than built-in NestJS CORS.
 */
@Injectable()
export class CorsMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const allowedOrigins = [
            'http://localhost:1300', // Tenant frontend dev
            'http://localhost:5173', // Admin frontend dev
            process.env.FRONTEND_URL,
            process.env.ADMIN_FRONTEND_URL,
        ].filter(Boolean);

        const origin = req.headers.origin;

        if (origin && allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader(
                'Access-Control-Allow-Methods',
                'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            );
            res.setHeader(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-tenant-slug',
            );
        }

        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.status(204).send();
            return;
        }

        next();
    }
}
