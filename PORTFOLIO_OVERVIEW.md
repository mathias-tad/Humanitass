# Humanitas ERP - Portfolio Project

## 🎯 Project Overview

This portfolio repository showcases the **Humanitas Enterprise Resource Planning (ERP)** system - a comprehensive, production-ready multi-tenant SaaS application for HR, payroll, and workforce management.

## 📂 Repository Structure

```
Humanitas-Portfolio/
├── backend/
│   ├── tenant-api/          # Main business logic (32+ files)
│   ├── admin-api/           # Tenant management (12+ files)
│   ├── python-api/          # AI services (8+ files)
│   └── workers/             # Background jobs (6+ files)
├── frontend/
│   ├── tenant-dashboard/    # User interface (25+ files)
│   └── admin-dashboard/     # Admin UI
├── infrastructure/          # DevOps configs
└── docs/                    # Documentation
```

## 🔑 Key Files in This Repository

### Backend Code Samples (20+ files)
1. **Authentication**: JWT-based auth with guards
2. **User Management**: CRUD with validation
3. **Attendance Tracking**: Check-in/out system
4. **Payroll Processing**: Automated salary calculations
5. **Database Service**: Multi-tenant connection pooling
6. **Middleware**: Tenant resolution, logging, rate limiting
7. **Interceptors**: Response transformation, caching
8. **AI Integration**: CV screening with ML

### Frontend Code Samples (8+ files)
1. **Dashboard**: Main metrics view
2. **Employee List**: Paginated table with search
3. **Auth Context**: Global authentication state
4. **Sidebar Navigation**: Role-based menu
5. **API Services**: Centralized HTTP client

### Configuration Files (6+ files)
1. **package.json**: Dependencies for each service
2. **requirements.txt**: Python AI packages
3. **.env.example**: Environment variables
4. **docker-compose.yml**: Service orchestration
5. **nginx.conf**: Reverse proxy setup

## 🚀 Quick Links

- **[Full Documentation](./FOLDER_STRUCTURE.md)** - Complete directory structure
- **[Code Samples Guide](./backend/CODE_SAMPLES.md)** - 22 annotated examples
- **[Live Demo](./README.md#live-demo)** - AWS deployment with test credentials

## 💡 What This Demonstrates

### Enterprise Architecture
✅ Multi-tenant SaaS design (database-per-tenant)
✅ Microservices architecture (8 services)
✅ RESTful API design
✅ JWT authentication & authorization
✅ Role-based access control

### Full-Stack Development
✅ Backend: NestJS, TypeORM, PostgreSQL
✅ Frontend: React, TypeScript, TailwindCSS
✅ AI/ML: Python, FastAPI, scikit-learn, spaCy
✅ DevOps: Docker, Nginx, PM2

### Clean Code Practices
✅ SOLID principles
✅ Dependency injection
✅ Repository pattern
✅ DTO validation
✅ Comprehensive documentation

## 📊 Statistics

- **Total Code Files**: 32+ production-quality samples
- **Lines of Code**: 5,000+ (in this portfolio)
- **Technologies**: 15+ frameworks/libraries
- **Dependencies**: 60+ npm/pip packages

## 🔗 Full Project

This is a curated portfolio showcasing selected code samples. The complete production system includes:
- 300+ files across all services
- 40,000+ lines of code
- Complete test suites
- CI/CD pipelines
- Production deployment

---

**Author**: Mathias Tadesse  
**Role**: Full-Stack Developer & Solution Architect  
**LinkedIn**: [Add your profile link]
