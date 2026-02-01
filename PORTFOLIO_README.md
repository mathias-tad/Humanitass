# Humanitas ERP - Portfolio Repository

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18.0-blue)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-green)](https://www.python.org/)

> **Comprehensive Multi-Tenant ERP System** for HR, Payroll & Workforce Management

This repository contains curated code samples and documentation from the Humanitas ERP project, showcasing enterprise-grade architecture and clean code practices.

## 📦 What's Inside

- **70+ Production Code Files** across 8 microservices
- **Complete Folder Structures** showing real-world organization
- **AI/ML Integration** for intelligent CV screening
- **Multi-Tenant Architecture** with database-per-tenant
- **Full-Stack Implementation** (Backend + Frontend + Infrastructure)

## 🗂️ Repository Structure

```
├── backend/
│   ├── tenant-api/       # 30+ files - Business logic API
│   ├── admin-api/        # 8+ files - Tenant management
│   ├── python-api/       # 5+ files - AI/ML services
│   └── workers/          # 3+ files - Background jobs
├── frontend/
│   └── tenant-dashboard/ # 20+ files - React SPA
├── infrastructure/       # Docker, Nginx configs
└── docs/                 # Comprehensive documentation
```

## 🎯 Key Features Demonstrated

### Backend Architecture
- ✅ **NestJS Microservices** - Modular, scalable architecture
- ✅ **TypeORM** - Type-safe database operations
- ✅ **Multi-Tenancy** - Dynamic database routing
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **DTOs & Validation** - class-validator integration
- ✅ **Swagger/OpenAPI** - Auto-generated documentation

### Frontend Excellence
- ✅ **React 18** - Modern functional components
- ✅ **TypeScript** - Full type safety
- ✅ **Context API** - Global state management
- ✅ **Custom Hooks** - Reusable logic (debounce, pagination)
- ✅ **Axios Interceptors** - Centralized API handling

### AI/ML Integration
- ✅ **FastAPI** - High-performance Python API
- ✅ **spaCy & scikit-learn** - NLP and ML processing
- ✅ **CV Screening** - Intelligent candidate ranking
- ✅ **Batch Processing** - Handle 100+ CVs efficiently

### DevOps & Infrastructure
- ✅ **Docker** - Containerization for all services
- ✅ **Nginx** - Reverse proxy & load balancing
- ✅ **PostgreSQL** - Multi-database management
- ✅ **PM2** - Process management

## 📖 Documentation

- **[FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)** - Complete directory trees for all 8 services
- **[CODE_SAMPLES.md](./backend/CODE_SAMPLES.md)** - Detailed guide to 22 key files
- **[README.md](./README.md)** - Full project overview with live demo
- **[PORTFOLIO_OVERVIEW.md](./PORTFOLIO_OVERVIEW.md)** - Quick reference

# Clone repository
git clone https://github.com/mathias-tad/humanitass.git

# Backend (Tenant API)
cd backend/tenant-api
npm install
npm run start:dev

# Frontend
cd frontend/tenant-dashboard
npm install
npm run dev

# Python API
cd backend/python-api
pip install -r requirements.txt
uvicorn main:app --reload
```

## 💻 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | NestJS, TypeORM, PostgreSQL, JWT, bcrypt, FastAPI |
| **Frontend** | React, TypeScript, Vite, TailwindCSS, Axios |
| **AI/ML** | Python, FastAPI, spaCy, scikit-learn, PyPDF2 |
| **Infrastructure** | Docker, Nginx, PM2 |
| **Database** | PostgreSQL (multi-tenant) |

## 📊 Portfolio Metrics

- **Total Files**: 70+ production-quality samples
- **Lines of Code**: 8,000+ (in this repository)
- **Dependencies**: 60+ npm packages, 15+ Python packages
- **Documentation**: 5 comprehensive guides

## 🎓 What This Demonstrates

### Software Engineering Excellence
- Clean code principles (SOLID)
- Design patterns (Repository, Factory, Decorator)
- Error handling & logging
- Input validation & sanitization
- Security best practices

### System Architecture
- Microservices communication
- Multi-tenant data isolation
- Horizontal scalability
- Caching strategies
- Background job processing

### Full-Stack Expertise
- Backend API development
- Frontend SPA development
- Database design
- DevOps & deployment
- AI/ML integration

## 🔗 Live Demo

**URL**: [http://65.2.31.144/login](http://65.2.31.144/login)

**Test Credentials**:
- Organization: `test`
- Email: `mathiasstadesse@gmail.com`
- Password: `12345678`

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Mathias Bekele**
- Full-Stack Developer & Solution Architect
- LinkedIn: [www.linkedin.com/in/mathias-tadesse-96336131a]
- Email: mathiasstadesse@gmail.com

---

⭐ If you find this portfolio helpful, please give it a star!
