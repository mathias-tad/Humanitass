# 📁 Humanitas ERP - Complete Folder Structure

This document provides a comprehensive overview of the folder structure for all microservices in the Humanitas multi-tenant ERP system.

---

## 🏗️ Root Structure

```
Humanitas-Portfolio/
├── backend/                    # All backend microservices
│   ├── tenant-api/            # Main business logic API
│   ├── admin-api/             # Tenant management API
│   ├── python-api/            # AI/Calculation service
│   └── workers/               # Background jobs service
├── frontend/                   # Frontend applications
│   ├── tenant-dashboard/      # Tenant user interface
│   └── admin-dashboard/       # System admin interface
├── infrastructure/            # DevOps and deployment
│   ├── nginx/                 # Reverse proxy configs
│   └── docker/                # Docker configurations
├── docs/                      # Documentation
│   ├── CODE_SAMPLES.md
│   ├── ARCHITECTURE.md
│   └── API_DOCS.md
└── README.md                  # Main documentation
```

---

## 1️⃣ Tenant API (NestJS - Port 3001)

**Purpose**: Core business logic for tenant operations (HR, Payroll, Attendance, etc.)

```
backend/tenant-api/
├── src/
│   ├── main.ts                           # Application entry point
│   ├── app.module.ts                     # Root module
│   │
│   ├── modules/                          # Feature modules
│   │   │
│   │   ├── auth/                         # Authentication & Authorization
│   │   │   ├── auth.controller.ts        ✅ [Sample]
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── guards/
│   │   │       ├── jwt-auth.guard.ts     ✅ [Sample]
│   │   │       └── roles.guard.ts
│   │   │
│   │   ├── users/                        # User Management
│   │   │   ├── users.controller.ts       ✅ [Sample]
│   │   │   ├── users.service.ts          ✅ [Sample]
│   │   │   ├── users.module.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts        ✅ [Sample]
│   │   │   └── dto/
│   │   │       ├── user.dto.ts           ✅ [Sample]
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   │
│   │   ├── employees/                    # Employee Records
│   │   │   ├── employees.controller.ts
│   │   │   ├── employees.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── employee.entity.ts
│   │   │   │   ├── department.entity.ts
│   │   │   │   └── position.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── attendance/                   # Attendance Tracking
│   │   │   ├── attendance.controller.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── attendance.entity.ts
│   │   │   │   ├── shift.entity.ts
│   │   │   │   └── overtime.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── payroll/                      # Payroll Processing
│   │   │   ├── payroll.controller.ts
│   │   │   ├── payroll.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── payroll.entity.ts
│   │   │   │   ├── payslip.entity.ts
│   │   │   │   └── deduction.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── leaves/                       # Leave Management
│   │   │   ├── leaves.controller.ts
│   │   │   ├── leaves.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── leave-request.entity.ts
│   │   │   │   └── leave-type.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── performance/                  # Performance Management
│   │   │   ├── performance.controller.ts
│   │   │   ├── performance.service.ts
│   │   │   ├── entities/
│   │   │   │   ├── kpi.entity.ts
│   │   │   │   └── goal.entity.ts
│   │   │   └── dto/
│   │   │
│   │   ├── reports/                      # Reporting
│   │   │   ├── reports.controller.ts
│   │   │   ├── reports.service.ts
│   │   │   └── generators/
│   │   │       ├── attendance-report.ts
│   │   │       └── payroll-report.ts
│   │   │
│   │   └── database/                     # Database Management
│   │       ├── database.service.ts       ✅ [Sample]
│   │       └── database.module.ts
│   │
│   ├── common/                           # Shared utilities
│   │   ├── middleware/
│   │   │   ├── tenant.middleware.ts      ✅ [Sample]
│   │   │   └── logger.middleware.ts
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts   ✅ [Sample]
│   │   │   └── logging.interceptor.ts
│   │   ├── decorators/
│   │   │   └── custom.decorators.ts      ✅ [Sample]
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/
│   │   │   └── tenant.guard.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   │
│   └── config/                           # Configuration
│       ├── database.config.ts
│       ├── jwt.config.ts
│       └── app.config.ts
│
├── test/                                 # Tests
│   ├── unit/
│   └── e2e/
│
├── package.json                          ✅ [Sample]
├── tsconfig.json
├── nest-cli.json
└── .env.example
```

**Key Statistics:**
- **Modules**: 10+ feature modules
- **Controllers**: 15+ endpoints
- **Services**: 20+ business logic services
- **Entities**: 30+ database tables
- **Dependencies**: 25+ npm packages

---

## 2️⃣ Admin API (NestJS - Port 3000)

**Purpose**: System administration and tenant provisioning

```
backend/admin-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── modules/
│   │   │
│   │   ├── tenants/                      # Tenant Management
│   │   │   ├── tenants.controller.ts     ✅ [Sample]
│   │   │   ├── tenants.service.ts        ✅ [Sample]
│   │   │   ├── tenants.module.ts
│   │   │   ├── entities/
│   │   │   │   └── tenant.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-tenant.dto.ts
│   │   │       └── update-tenant.dto.ts
│   │   │
│   │   ├── subscriptions/                # Subscription Management
│   │   │   ├── subscriptions.controller.ts
│   │   │   ├── subscriptions.service.ts
│   │   │   └── entities/
│   │   │       ├── subscription.entity.ts
│   │   │       └── plan.entity.ts
│   │   │
│   │   ├── auth/                         # Admin Authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── guards/
│   │   │       └── admin-auth.guard.ts
│   │   │
│   │   ├── billing/                      # Billing & Invoicing
│   │   │   ├── billing.controller.ts
│   │   │   ├── billing.service.ts
│   │   │   └── entities/
│   │   │       └── invoice.entity.ts
│   │   │
│   │   └── analytics/                    # System Analytics
│   │       ├── analytics.controller.ts
│   │       ├── analytics.service.ts
│   │       └── dto/
│   │
│   ├── common/
│   │   ├── guards/
│   │   └── interceptors/
│   │
│   └── config/
│       └── database.config.ts
│
├── package.json                          ✅ [Sample]
├── tsconfig.json
└── .env.example
```

**Key Features:**
- Database provisioning automation
- Tenant lifecycle management
- Subscription & billing
- System-wide analytics

---

## 3️⃣ Python API (FastAPI - Port 8000)

**Purpose**: AI-powered future services and complex calculations

```
backend/python-api/
├── main.py                               ✅ [Sample]
├── requirements.txt                      ✅ [Sample]
│
├── routers/                              # API Routes
│   ├── cv_analysis.py                    ✅ [Sample]
│   ├── payroll_calculations.py
│   ├── predictive_analytics.py
│   └── data_processing.py
│
├── services/                             # Business Logic
│   ├── ai/
│   │   ├── cv_analyzer.py
│   │   ├── nlp_processor.py
│   │   └── recommender.py
│   ├── calculations/
│   │   ├── payroll_calculator.py
│   │   ├── tax_calculator.py
│   │   └── overtime_calculator.py
│   └── analytics/
│       ├── turnover_predictor.py
│       └── performance_analyzer.py
│
├── models/                               # Pydantic Models
│   ├── cv_models.py
│   ├── payroll_models.py
│   └── analytics_models.py
│
├── utils/                                # Utilities
│   ├── pdf_parser.py
│   ├── text_processor.py
│   └── validators.py
│
├── config/
│   └── settings.py
│
└── tests/
    ├── test_cv_analysis.py
    └── test_calculations.py
```

**AI/ML Capabilities:**
- CV screening & ranking
- Predictive analytics
- NLP text processing
- Complex payroll calculations

---

## 4️⃣ Background Workers (NestJS)

**Purpose**: Scheduled tasks and background job processing

```
backend/workers/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── services/
│   │   ├── worker.service.ts             ✅ [Sample]
│   │   ├── attendance-processor.service.ts
│   │   ├── payroll-runner.service.ts
│   │   ├── report-generator.service.ts
│   │   └── email-sender.service.ts
│   │
│   ├── jobs/                             # Cron Jobs
│   │   ├── attendance.jobs.ts
│   │
│   ├── queues/                           # Bull Queue Jobs
│   │   ├── email.queue.ts
│   │   ├── pdf.queue.ts
│   │   └── import.queue.ts
│   │
│   └── config/
│       └── queue.config.ts
│
├── package.json
└── .env.example
```

**Scheduled Tasks:**
- Nightly attendance processing (2 AM)
- Monthly auto-payroll (1st at 3 AM)
- Report generation (5th at 4 AM)
- Weekly database cleanup (Sundays 1 AM)
- Daily email digests (8 AM)

---

## 5️⃣ Tenant Frontend (React + TypeScript)

**Purpose**: User interface for tenant employees and managers

```
frontend/tenant-dashboard/
├── public/
│   ├── index.html
│   └── assets/
│       └── images/
│
├── src/
│   ├── main.tsx                          # Entry point
│   ├── App.tsx                           # Root component
│   │
│   ├── pages/                            # Route pages
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── Employees/
│   │   │   ├── EmployeeList.tsx
│   │   │   ├── EmployeeDetail.tsx
│   │   │   └── AddEmployee.tsx
│   │   ├── Attendance/
│   │   │   ├── AttendanceView.tsx
│   │   │   └── CheckInOut.tsx
│   │   ├── Payroll/
│   │   │   ├── PayrollRun.tsx
│   │   │   └── PayslipView.tsx
│   │   ├── Leaves/
│   │   │   ├── LeaveRequests.tsx
│   │   │   └── LeaveCalendar.tsx
│   │   ├── Performance/
│   │   │   ├── KPIs.tsx
│   │   │   └── Goals.tsx
│   │   ├── Reports/
│   │   │   └── ReportsDashboard.tsx
│   │   └── Settings/
│   │       └── CompanySettings.tsx
│   │
│   ├── components/                       # Reusable components
│   │   ├── EmployeeList.tsx              ✅ [Sample]
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── Common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Card.tsx
│   │   ├── Charts/
│   │   │   ├── BarChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   └── PieChart.tsx
│   │   └── Forms/
│   │       ├── EmployeeForm.tsx
│   │       └── LeaveForm.tsx
│   │
│   ├── contexts/                         # React Context
│   │   ├── AuthContext.tsx               ✅ [Sample]
│   │   ├── ThemeContext.tsx
│   │   └── TenantContext.tsx
│   │
│   ├── hooks/                            # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── usePagination.ts
│   │   └── useDebounce.ts
│   │
│   ├── services/                         # API services
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── employeeService.ts
│   │   ├── attendanceService.ts
│   │   └── payrollService.ts
│   │
│   ├── types/                            # TypeScript types
│   │   ├── user.types.ts
│   │   ├── employee.types.ts
│   │   ├── attendance.types.ts
│   │   └── api.types.ts
│   │
│   ├── utils/                            # Utilities
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   └── styles/                           # Styling
│       ├── index.css
│       ├── tailwind.css
│       └── components/
│
├── package.json                          ✅ [Sample]
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env.example
```

**Key Features:**
- 15+ page routes
- 30+ reusable components
- React Query for state management
- TailwindCSS styling
- Mobile responsive

---

## 6️⃣ Admin Frontend (React + TypeScript)

**Purpose**: System administrator dashboard

```
frontend/admin-dashboard/
├── src/
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Tenants/
│   │   │   ├── TenantList.tsx
│   │   │   ├── CreateTenant.tsx
│   │   │   └── TenantDetails.tsx
│   │   ├── Subscriptions/
│   │   ├── Billing/
│   │   └── Analytics/
│   │
│   ├── components/
│   ├── contexts/
│   ├── services/
│   └── styles/
│
└── package.json
```

---

## 7️⃣ Infrastructure

### Nginx Configuration

```
infrastructure/nginx/
├── nginx.conf                            ✅ [Sample]
├── ssl/
│   ├── cert.pem
│   └── key.pem
└── conf.d/
    ├── admin-api.conf
    ├── tenant-api.conf
    └── frontend.conf
```

### Docker Setup

```
infrastructure/docker/
├── docker-compose.yml                    ✅ [Sample]
├── docker-compose.prod.yml
├── Dockerfile.tenant-api
├── Dockerfile.admin-api
├── Dockerfile.python-api
├── Dockerfile.workers
└── Dockerfile.frontend
```

---

## 8️⃣ Database Schemas

### Master Database (PostgreSQL)

```sql
master_db/
├── tenants                    # Tenant organizations
├── subscriptions              # Subscription plans
├── invoices                   # Billing records
└── system_logs                # Audit logs
```

### Tenant Databases (Dynamic - One per tenant)

```sql
tenant_{slug}_db/
├── users                      # Tenant users
├── employees                  # Employee records
├── departments                # Org structure
├── attendance                 # Attendance logs
├── shifts                     # Shift schedules
├── payroll                    # Payroll records
├── payslips                   # Employee payslips
├── leave_requests             # Leave management
├── leave_types                # Leave categories
├── performance_kpis           # KPI definitions
├── performance_goals          # Goal tracking
├── employee_categories        # Employee types
└── settings                   # Tenant configuration
```

---

## 📊 Summary Statistics

| Service | Language | Files | Lines of Code | Dependencies |
|---------|----------|-------|---------------|--------------|
| Tenant API | TypeScript | 100+ | 15,000+ | 25+ packages |
| Admin API | TypeScript | 40+ | 5,000+ | 20+ packages |
| Python API | Python | 25+ | 3,000+ | 15+ packages |
| Workers | TypeScript | 20+ | 2,000+ | 20+ packages |
| Tenant Frontend | TypeScript/TSX | 80+ | 12,000+ | 20+ packages |
| Admin Frontend | TypeScript/TSX | 50+ | 7,000+ | 20+ packages |
| **Total** | **Mixed** | **315+** | **44,000+** | **120+** |

---

## 🔑 Key Architecture Patterns

### Backend
- ✅ **Modular architecture** - Feature-based modules
- ✅ **Dependency Injection** - NestJS DI container
- ✅ **Repository Pattern** - TypeORM repositories
- ✅ **DTOs** - Data validation with class-validator
- ✅ **Guards & Middleware** - Request processing
- ✅ **Interceptors** - Response transformation

### Frontend
- ✅ **Component-based** - Reusable React components
- ✅ **Context API** - Global state management
- ✅ **Custom Hooks** - Reusable logic
- ✅ **Service Layer** - API abstraction
- ✅ **TypeScript** - Type safety

### Infrastructure
- ✅ **Microservices** - Independent services
- ✅ **Docker** - Containerization
- ✅ **Nginx** - Reverse proxy & load balancing
- ✅ **PostgreSQL** - Multi-tenant databases

---

## 📝 Code Sample Coverage

**✅ 22 Production-Quality Samples Across All Services:**

1. Tenant API (10 files)
2. Admin API (2 files)
3. Python API (2 files)
4. Workers (1 file)
5. Frontend (2 files)
6. Package files (4 files)
7. Infrastructure (1 file)

Each sample demonstrates enterprise-grade patterns and best practices!
