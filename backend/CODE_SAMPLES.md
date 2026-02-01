# Code Samples Overview

This directory contains well-documented, production-quality code samples that demonstrate clean coding practices, architectural patterns, and best practices used in the Humanitas ERP platform.

---

## 📁 Directory Structure

```
backend/
├── tenant-api/                         # Tenant Business Logic API (Port 3001)
│   └── src/
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.controller.ts          → Authentication endpoints
│       │   │   └── guards/
│       │   │       └── jwt-auth.guard.ts       → JWT validation & tenant isolation
│       │   ├── database/
│       │   │   └── database.service.ts         → Multi-tenant connection management
│       │   └── users/
│       │       ├── dto/
│       │       │   └── user.dto.ts             → DTOs with validation
│       │       ├── entities/
│       │       │   └── user.entity.ts          → TypeORM entities
│       │       ├── users.controller.ts         → RESTful user management
│       │       └── users.service.ts            → Business logic layer
│       └── common/
│           ├── interceptors/
│           │   └── response.interceptor.ts     → Response transformation & logging
│           ├── middleware/
│           │   └── tenant.middleware.ts        → Tenant resolution & rate limiting
│           └── decorators/
│               └── custom.decorators.ts        → Custom parameter decorators
├── admin-api/                          # Admin/Tenant Management API (Port 3000)
│   └── src/modules/tenants/
│       ├── tenants.controller.ts               → Tenant CRUD operations
│       └── tenants.service.ts                  → Tenant provisioning & DB creation
├── workers/                            # Background Jobs Service
│   └── worker.service.ts                       → Cron jobs (attendance, payroll, cleanup)
└── python-api/                         # AI/Calculation Service (Port 8000)
    └── cv_analysis.py                          → AI-powered CV screening

frontend/tenant-dashboard/src/
└── components/
    └── EmployeeList.tsx                        → React component with hooks

infrastructure/
└── nginx/
    └── nginx.conf                              → Reverse proxy configuration
```



---

## 🎯 What These Samples Demonstrate

### 1. **Authentication Controller** (`auth/auth.controller.ts`)

**Key Patterns:**
- ✅ RESTful API design with proper HTTP methods
- ✅ Secure authentication with HTTP-only cookies
- ✅ Token rotation for enhanced security
- ✅ Comprehensive API documentation using Swagger decorators
- ✅ Error handling and validation

**Highlights:**
```typescript
// Secure cookie storage
response.setCookie('access_token', token, {
  httpOnly: true,    // Prevent XSS
  secure: true,      // HTTPS only
  sameSite: 'lax',  // CSRF protection
});
```

**Skills Demonstrated:**
- NestJS framework expertise
- JWT authentication implementation
- API security best practices
- Clean code with extensive documentation

---

### 2. **JWT Auth Guard** (`auth/guards/jwt-auth.guard.ts`)

**Key Patterns:**
- ✅ Custom guard implementation
- ✅ Multi-source token extraction (header + cookies)
- ✅ Tenant context injection
- ✅ Clear separation of concerns

**Highlights:**
```typescript
// Multi-tenant isolation
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = request.user;
    if (!user.tenantId) {
      throw new UnauthorizedException();
    }
    request.tenantId = user.tenantId; // 👈 Inject tenant context
    return true;
  }
}
```

**Skills Demonstrated:**
- Advanced NestJS guards
- Security patterns (authorization vs authentication)
- Context propagation in request pipeline
- Type-safe implementation

---

### 3. **Database Service** (`database/database.service.ts`)

**Key Patterns:**
- ✅ Multi-tenant connection pooling
- ✅ Dynamic database creation
- ✅ URL parsing for cloud databases
- ✅ Graceful error handling
- ✅ Resource cleanup (OnModuleDestroy)

**Highlights:**
```typescript
// Connection pooling with reuse
async getTenantConnection(dbName: string): Promise<DataSource> {
  if (this.connections.has(dbName)) {
    return this.connections.get(dbName); // ♻️ Reuse existing
  }
  
  const connection = await this.createConnection(dbName);
  this.connections.set(dbName, connection); // 💾 Cache for future
  return connection;
}
```

**Skills Demonstrated:**
- Multi-tenant system design
- PostgreSQL advanced features
- Connection pooling optimization
- Database provisioning automation
- Cloud deployment compatibility (Render, AWS, Supabase)

---

### 4. **User Entities** (`users/entities/user.entity.ts`)

**Key Patterns:**
- ✅ TypeORM entity definitions
- ✅ Database schema design
- ✅ Type safety with TypeScript
- ✅ Comprehensive column documentation

**Highlights:**
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;  // 👈 UUID for distributed systems
  
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  basic_salary: number;  // 👈 Precise financial calculations
  
  @CreateDateColumn()
  created_at: Date;  // 👈 Automatic timestamp
}
```

**Skills Demonstrated:**
- ORM proficiency (TypeORM)
- Database normalization
- Entity relationships
- Financial data handling (decimal precision)

---

### 5. **Users Controller** (`users/users.controller.ts`)

**Key Patterns:**
- ✅ RESTful resource management (CRUD)
- ✅ Pagination and filtering
- ✅ Guard composition for security
- ✅ Tenant-scoped operations
- ✅ Soft deletes for data preservation

**Highlights:**
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard)  // 🔐 Security layers
export class UsersController {
  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('search') search?: string,  // 🔍 Filtering
  ) {
    return this.usersService.findAll(req.user.tenantId, { page, search });
  }
}
```

**Skills Demonstrated:**
- RESTful API design
- Guard composition
- Query parameter handling
- Tenant isolation enforcement
- Dependency injection

---

### 6. **User DTOs** (`users/dto/user.dto.ts`)

**Key Patterns:**
- ✅ Comprehensive validation using class-validator
- ✅ Swagger API documentation
- ✅ Separate DTOs for Create/Update/Query
- ✅ Type safety with TypeScript
- ✅ Custom validation messages

**Highlights:**
```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'john@company.com' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty({ message: 'Basic salary is required' })
  basic_salary: number;
}
```

**Skills Demonstrated:**
- Input validation patterns
- API contract definition
- Type-safe DTOs
- Error message customization
- Swagger integration

---

### 7. **Users Service** (`users/users.service.ts`)

**Key Patterns:**
- ✅ Service layer with business logic
- ✅ Repository pattern with TypeORM
- ✅ Pagination and filtering
- ✅ Error handling (NotFoundException, ConflictException)
- ✅ Password hashing with bcrypt
- ✅ Data sanitization (removing sensitive fields)

**Highlights:**
```typescript
async findAll(tenantId: string, query: UserQueryDto) {
  const queryBuilder = repository.createQueryBuilder('user');
  
  // Dynamic filtering
  if (search) {
    queryBuilder.where('LOWER(user.full_name) LIKE LOWER(:search)', 
      { search: `%${search}%` });
  }
  
  // Pagination
  queryBuilder.skip((page - 1) * limit).take(limit);
  
  const [users, total] = await queryBuilder.getManyAndCount();
  return { data, total, page, limit };
}
```

**Skills Demonstrated:**
- Complex business logic implementation
- Database query optimization
- Security best practices (password hashing)
- Soft delete pattern
- Aggregation queries (statistics)
- Data transformation

---

### 8. **Middleware** (`common/middleware/tenant.middleware.ts`)

**Key Patterns:**
- ✅ Custom middleware implementation
- ✅ Multi-strategy tenant resolution
- ✅ Request logging
- ✅ Rate limiting
- ✅ CORS handling

**Highlights:**
```typescript
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    // Strategy 1: Check header
    let tenantSlug = req.headers['x-tenant-slug'];
    
    // Strategy 2: Extract from JWT
    if (!tenantSlug) {
      const token = this.extractToken(req);
      const payload = await this.jwtService.verify(token);
      tenantSlug = payload.tenantSlug;
    }
    
    // Inject into request
    req.tenantSlug = tenantSlug;
    next();
  }
}
```

**Skills Demonstrated:**
- Middleware patterns
- Request/response manipulation
- JWT token extraction
- Rate limiting implementation
- Logging and monitoring

---

### 9. **React Component** (`frontend/components/EmployeeList.tsx`)

**Key Patterns:**
- ✅ Modern React with hooks (useState, useEffect)
- ✅ TypeScript for type safety
- ✅ Pagination UI
- ✅ Search with debouncing
- ✅ Loading and error states
- ✅ Responsive table design

**Highlights:**
```typescript
const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);
  
  // Fetch data
  useEffect(() => {
    fetchEmployees();
  }, [page, debouncedSearch, roleFilter]);
}
```

**Skills Demonstrated:**
- React hooks mastery
- API integration with axios
- State management
- Performance optimization (debouncing)
- User experience (loading/error states)
- TypeScript in React

---

### 10. **Nginx Configuration** (`infrastructure/nginx/nginx.conf`)

**Key Patterns:**
- ✅ Reverse proxy setup
- ✅ Load balancing
- ✅ SSL/TLS configuration
- ✅ Static file serving
- ✅ WebSocket support
- ✅ Security headers

**Highlights:**
```nginx
# Upstream load balancing
upstream tenant_api {
    server tenant-api:3001;
    keepalive 64;
}

# Reverse proxy with headers
location /api/ {
    proxy_pass http://tenant_api;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Tenant-Slug $tenant_slug;
}

# WebSocket support
location /ws {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
}
```

**Skills Demonstrated:**
- Nginx reverse proxy configuration
- Load balancing strategies
- SSL/TLS setup
- Request routing
- WebSocket proxying
- Performance optimization (compression, caching)

---

### 11. **Interceptors** (`common/interceptors/response.interceptor.ts`)

**Key Patterns:**
- ✅ Response transformation
- ✅ Request/response logging
- ✅ Error handling
- ✅ Caching strategy
- ✅ Performance monitoring

**Highlights:**
```typescript
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        message: this.getSuccessMessage(method),
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

**Skills Demonstrated:**
- RxJS operators (map, tap, catchError)
- Interceptor pattern
- Response standardization
- Performance tracking
- In-memory caching

---

### 12. **Custom Decorators** (`common/decorators/custom.decorators.ts`)

**Key Patterns:**
- ✅ Parameter decorators
- ✅ Context extraction
- ✅ Code reusability
- ✅ Clean syntax

**Highlights:**
```typescript
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.user?.[data] : request.user;
  },
);

// Usage in controller:
@Get('profile')
getProfile(@CurrentUser() user: JwtPayload) {
  return user;
}
```

**Skills Demonstrated:**
- NestJS decorator creation
- ExecutionContext manipulation
- Type-safe parameter extraction
- Clean, readable code patterns

---

### 13. **AI CV Analysis** (`python-api/cv_analysis.py`)

**Key Patterns:**
- ✅ Machine learning integration
- ✅ Natural Language Processing
- ✅ FastAPI REST endpoints
- ✅ PDF parsing
- ✅ Intelligent scoring algorithms

**Highlights:**
```python
class CVAnalyzer:
    def analyze_cv(self, cv_text: str, job_requirements: dict) -> dict:
        # Extract skills using NLP
        skills = self.extract_skills(cv_text)
        
        # Calculate weighted score
        overall_score = (
            skill_match * 0.4 +
            exp_score * 0.3 +
            edu_score * 0.2 +
            completeness * 0.1
        )
        
        return {
            'overall_score': overall_score,
            'recommendation': self.get_recommendation(score)
        }
```

**Skills Demonstrated:**
- AI/ML implementation (scikit-learn, spaCy)
- Natural language processing
- PDF/document parsing (PyPDF2)
- RESTful API design (FastAPI)
- Batch processing
- Intelligent scoring algorithms
- Real-world AI application

---

### 14. **Admin Tenants Controller** (`admin-api/tenants.controller.ts`)

**Key Patterns:**
- ✅ Admin API design
- ✅ Tenant management endpoints
- ✅ System-level operations
- ✅ Authorization guards
- ✅ Comprehensive API documentation

**Highlights:**
```typescript
@Controller('api/v1/tenants')
@UseGuards(JwtAuthGuard) // Admin only
export class TenantsController {
  @Post()
  async create(@Body() dto: CreateTenantDto) {
    // Creates tenant + dedicated database
    return this.tenantsService.createTenant(dto);
  }
  
  @Post(':id/suspend')
  async suspend(@Param('id') id: string) {
    return this.tenantsService.suspendTenant(id);
  }
}
```

**Skills Demonstrated:**
- Multi-tenant system administration
- RESTful API for admin operations
- Guard-based authorization
- Dangerous operation handling
- Comprehensive endpoint coverage

---

### 15. **Tenants Provisioning Service** (`admin-api/tenants.service.ts`)

**Key Patterns:**
- ✅ Database provisioning automation
- ✅ Schema initialization
- ✅ Data seeding
- ✅ Transaction management
- ✅ Error handling with rollback

**Highlights:**
```typescript
async createTenant(dto: CreateTenantDto): Promise<Tenant> {
  // 1. Create tenant record
  const tenant = await this.tenantsRepository.save({
    slug, database_name: `tenant_${slug}`
  });
  
  try {
    // 2. Create PostgreSQL database
    await this.createTenantDatabase(tenant.database_name);
    
    // 3. Initialize schema
    await this.initializeTenantSchema(tenant.database_name);
    
    // 4. Seed default data
    await this.seedTenantData(tenant.database_name, adminData);
    
    return tenant;
  } catch (error) {
    // Rollback on failure
    await this.tenantsRepository.delete(tenant.id);
    throw error;
  }
}
```

**Skills Demonstrated:**
- Automated database provisioning
- Dynamic schema creation
- Raw SQL execution
- Transaction management
- Rollback strategies
- Multi-step provisioning process
- System-level database operations

---

### 16. **Background Worker Service** (`workers/worker.service.ts`)

**Key Patterns:**
- ✅ Cron job scheduling
- ✅ Multi-tenant batch processing
- ✅ Automated workflows
- ✅ Error handling and logging
- ✅ System maintenance tasks

**Highlights:**
```typescript
@Injectable()
export class WorkerService {
  // Run every night at 2 AM
  @Cron('0 2 * * *')
  async processMonthlyAttendance() {
    const tenants = await this.getActiveTenants();
    
    for (const tenant of tenants) {
      await this.processAttendanceForTenant(tenant);
    }
  }
  
  // Auto-payroll on 1st of every month at 3 AM
  @Cron('0 3 1 * *')
  async autoRunPayroll() {
    const tenants = await this.getTenantsWithAutoPayroll();
    
    for (const tenant of tenants) {
      await this.runPayrollForTenant(tenant);
    }
  }
  
  // Database cleanup every Sunday at 1 AM
  @Cron('0 1 * * 0')
  async databaseCleanup() {
    // Clean old logs, expired sessions, etc.
  }
}
```

**Skills Demonstrated:**
- Cron job scheduling (@nestjs/schedule)
- Background task automation
- Multi-tenant batch processing
- Database maintenance
- Logging and monitoring
- Error recovery strategies
- Scheduled email sending
- Subscription management
- System health checks

---

## 🏢 Service Coverage Summary

All **8 microservices** are now represented with production-quality code samples:

### 1. **Tenant API** (Business Logic) ✅
- `auth.controller.ts` - Authentication
- `jwt-auth.guard.ts` - Security
- `database.service.ts` - Multi-tenancy
- `users.controller.ts` - RESTful CRUD
- `users.service.ts` - Business logic
- `user.dto.ts` - Validation
- `user.entity.ts` - Database schema
- `tenant.middleware.ts` - Request processing
- `response.interceptor.ts` - Response transformation
- `custom.decorators.ts` - Code utilities

### 2. **Admin API** (Tenant Management) ✅
- `tenants.controller.ts` - Admin operations
- `tenants.service.ts` - Database provisioning

### 3. **Background Workers** (Cron Jobs) ✅
- `worker.service.ts` - Automated tasks

### 4. **Python API** (AI/Calculations) ✅
- `cv_analysis.py` - AI-powered CV screening

### 5. **Tenant Frontend** (React) ✅
- `EmployeeList.tsx` - Modern React component

### 6. **Admin Frontend** 
- (Not included - similar to Tenant Frontend)

### 7. **Python Worker**
- (Not included - similar to Background Workers)

### 8. **Nginx** (API Gateway) ✅
- `nginx.conf` - Reverse proxy configuration

---


## 🔥 Code Quality Highlights



### Documentation
- **JSDoc comments** on all classes and methods
- **Inline explanations** for complex logic
- **Parameter descriptions** for clarity
- **Return type documentation**

### Type Safety
- **Full TypeScript** with strict mode
- **Interface definitions** for DTOs
- **Type annotations** everywhere
- **No use of `any` types** (except for Express Request)

### Error Handling
- **Proper exception throwing** with HTTP status codes
- **Graceful degradation** for failures
- **Try-catch blocks** where appropriate
- **Meaningful error messages**

### Security
- **HTTP-only cookies** to prevent XSS
- **JWT with expiration** for session management
- **Tenant isolation guards** for data security
- **SQL injection prevention** via parameterized queries

### Performance
- **Connection pooling** to reduce overhead
- **Lazy initialization** of resources
- **Pagination** for large datasets
- **Resource cleanup** on module destroy

---

## 💼 Enterprise Patterns Used

| Pattern | Implementation | Benefit |
|---------|---------------|---------|
| **Repository Pattern** | TypeORM entities & repositories | Abstraction over data access |
| **Guard Pattern** | JWT & Tenant guards | Reusable authorization logic |
| **Service Layer** | Business logic in services | Separation of concerns |
| **Dependency Injection** | NestJS DI container | Testability & modularity |
| **Decorator Pattern** | NestJS decorators (@Get, @Post) | Clean route definitions |
| **Factory Pattern** | Dynamic connection creation | Flexible database connections |

---

## 📚 Technologies Used

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for auth
- **TypeScript** - Type-safe JavaScript
- **Swagger** - API documentation

---

## 🎯 Next Steps

To explore more:
1. View the [Architecture Documentation](../docs/ARCHITECTURE.md)
2. Check the [Complete README](../README.md)
3. Try the [Live Demo](http://65.2.31.144/login)
4. Read the [Getting Started Guide](../GETTING_STARTED.md)

---

**These samples represent production-grade code with enterprise patterns!** 🚀
