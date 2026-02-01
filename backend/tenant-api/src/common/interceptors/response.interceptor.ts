import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

/**
 * Response Transform Interceptor
 * 
 * Standardizes all API responses into a consistent format.
 * Wraps successful responses in a data envelope with metadata.
 * 
 * Standard Response Format:
 * {
 *   success: true,
 *   data: <response data>,
 *   message: "Operation successful",
 *   timestamp: "2024-01-01T00:00:00.000Z",
 *   path: "/api/v1/users"
 * }
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { url, method } = request;

        return next.handle().pipe(
            map((data) => ({
                success: true,
                data,
                message: this.getSuccessMessage(method),
                timestamp: new Date().toISOString(),
                path: url,
            })),
        );
    }

    private getSuccessMessage(method: string): string {
        const messages = {
            POST: 'Resource created successfully',
            PUT: 'Resource updated successfully',
            PATCH: 'Resource updated successfully',
            DELETE: 'Resource deleted successfully',
            GET: 'Operation successful',
        };
        return messages[method] || 'Operation successful';
    }
}

/**
 * Logging Interceptor
 * 
 * Logs all incoming requests and outgoing responses.
 * Useful for debugging and monitoring.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user } = request;
        const startTime = Date.now();

        console.log(`📥 [REQUEST] ${method} ${url}`);
        console.log(`👤 User: ${user?.email || 'Anonymous'}`);
        console.log(`🏢 Tenant: ${user?.tenantSlug || 'N/A'}`);
        if (Object.keys(body || {}).length > 0) {
            console.log(`📦 Body:`, JSON.stringify(body, null, 2));
        }

        return next.handle().pipe(
            tap((data) => {
                const duration = Date.now() - startTime;
                console.log(`📤 [RESPONSE] ${method} ${url} - ${duration}ms`);
                console.log(`✅ Success`);
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;
                console.log(`📤 [RESPONSE] ${method} ${url} - ${duration}ms`);
                console.log(`❌ Error: ${error.message}`);
                return throwError(() => error);
            }),
        );
    }
}

/**
 * Error Transform Interceptor
 * 
 * Transforms errors into a consistent format.
 * Hides internal error details in production.
 */
@Injectable()
export class ErrorTransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((error) => {
                const request = context.switchToHttp().getRequest();
                const { url, method } = request;

                // Transform error to standard format
                const errorResponse = {
                    success: false,
                    error: {
                        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                        message: error.message || 'Internal server error',
                        timestamp: new Date().toISOString(),
                        path: url,
                        method,
                    },
                    // Include stack trace only in development
                    ...(process.env.NODE_ENV === 'development' && {
                        stack: error.stack,
                    }),
                };

                return throwError(
                    () =>
                        new HttpException(
                            errorResponse,
                            error.status || HttpStatus.INTERNAL_SERVER_ERROR,
                        ),
                );
            }),
        );
    }
}

/**
 * Cache Interceptor
 * 
 * Caches GET requests to improve performance.
 * Simple in-memory cache (use Redis in production).
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_TTL = 60000; // 1 minute

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;

        // Only cache GET requests
        if (method !== 'GET') {
            return next.handle();
        }

        const cacheKey = url;
        const cached = this.cache.get(cacheKey);

        // Return cached response if valid
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            console.log(`💾 Cache HIT: ${url}`);
            return new Observable((observer) => {
                observer.next(cached.data);
                observer.complete();
            });
        }

        // Execute request and cache response
        return next.handle().pipe(
            tap((data) => {
                console.log(`💾 Cache MISS: ${url} - Caching response`);
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now(),
                });
            }),
        );
    }

    // Clear cache (call from a service or cron job)
    clearCache(pattern?: string) {
        if (pattern) {
            // Clear specific pattern
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            // Clear all cache
            this.cache.clear();
        }
    }
}

/**
 * Performance Monitoring Interceptor
 * 
 * Monitors request performance and logs slow requests.
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
    private readonly SLOW_REQUEST_THRESHOLD = 1000; // 1 second

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;
        const startTime = Date.now();

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - startTime;

                if (duration > this.SLOW_REQUEST_THRESHOLD) {
                    console.warn(
                        `⚠️ SLOW REQUEST: ${method} ${url} took ${duration}ms`,
                    );
                    // TODO: Send to monitoring service (Sentry, DataDog, etc.)
                }
            }),
        );
    }
}
