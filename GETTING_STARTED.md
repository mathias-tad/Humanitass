# Getting Started with Humanitas ERP

This guide will help you understand the Humanitas architecture and run the platform locally.

---

## 📋 Prerequisites

### Required
- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+
- **Docker & Docker Compose** (recommended)
- **Git**

### Recommended
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Docker
  - PostgreSQL

---

 https://github.com/mathias-tad/humanitass.git
cd humanitass

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# For local development, you can use the containerized PostgreSQL
```

### 3. Start All Services

```bash
# Start all 8 microservices
docker-compose -f infrastructure/docker-compose.yml up -d

# View logs
docker-compose -f infrastructure/docker-compose.yml logs -f

# Check service status
docker-compose -f infrastructure/docker-compose.yml ps
```

### 4. Access the Applications

| Service | URL | Description |
|---------|-----|-------------|
| **Admin Dashboard** | http://localhost:5173 | Super admin interface |
| **Tenant Dashboard** | http://localhost:1300 | End-user application |
| **Admin API** | http://localhost:3000/api/v1 | Tenant management API |
| **Tenant API** | http://localhost:3001/api/v1 | Business logic API |
| **Python API** | http://localhost:8000/docs | FastAPI Swagger docs |
| **Nginx Gateway** | http://localhost:80 | Reverse proxy |

---

## 🔧 Manual Setup (Development)

### 1. Setup PostgreSQL

```bash
# Create master database
createdb humanitas

# The application will create tenant databases automatically
```

### 2. Setup Admin API

```bash
cd backend/admin-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL

# Run migrations (if any)
npm run migration:run

# Start development server
npm run start:dev
```

### 3. Setup Tenant API

```bash
cd backend/tenant-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run start:dev
```

### 4. Setup Python Calculation Service

```bash
cd backend/calculation-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python run.py
```

### 5. Setup Frontends

```bash
# Admin Frontend
cd frontend/admin-dashboard
npm install
npm run dev

# Tenant Frontend
cd frontend/tenant-dashboard
npm install
npm run dev
```

---

## 🧪 Testing the Multi-Tenant System

### Create a New Tenant

```bash
# Using curl
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "demo-company",
    "name": "Demo Company Inc.",
    "owner_email": "admin@democompany.com"
  }'
```

This will:
1. Create a tenant record in the master database
2. Create a dedicated database `tenant_demo_company`
3. Initialize the schema with all tables
4. Create an admin user
5. Return credentials

### Access Tenant Dashboard

1. Navigate to http://localhost:1300
2. Log in with the credentials from tenant creation
3. Explore the HR/Payroll features

---

## 📖 Understanding the Architecture

### Service Flow

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nginx Gateway  │  ← Routes to appropriate service
└────────┬────────┘
         │
         ├──────────► Admin API (Port 3000)
         │                 │
         │                 ▼
         │            Master DB
         │
         └──────────► Tenant API (Port 3001)
                           │
                           ├──────► Tenant DB 1
                           ├──────► Tenant DB 2
                           └──────► Tenant DB N
```

### Request Flow Example

1. **User Login**: POST `/api/v1/auth/login`
   - Tenant API validates credentials
   - Looks up user in correct tenant database
   - Returns JWT with `tenantId` claim

2. **Fetch Employees**: GET `/api/v1/users`
   - JWT middleware extracts `tenantId`
   - Database service connects to tenant's database
   - Returns employees for that tenant only

3. **Run Payroll**: POST `/api/v1/payroll/run`
   - Tenant API receives request
   - Calls Python Calculation Service
   - Python service performs complex calculations
   - Results saved to tenant database

---

## 🔐 Authentication Flow

```typescript
// 1. User logs in
POST /api/v1/auth/login
{ organization_id: "test", email: "user@example.com", password: "secret" }

// 2. Server validates and returns JWT
{
  accessToken: "eyJhbGciOiJIUzI1...",
  refreshToken: "dGhpc2lzYXJlZnJl..."
}

// 3. JWT contains tenant context
{
  sub: "user-uuid",
  email: "user@example.com",
 tenantId: "tenant-uuid",  // ← Critical for multi-tenancy
  role: "admin"
}

// 4. All subsequent requests include token
GET /api/v1/users
Authorization: Bearer eyJhbGciOiJIUzI1...

// 5. Tenant Guard extracts tenantId
// 6. Database Service connects to correct tenant DB
```

---

## 🛠️ Useful Commands

### Docker Commands

```bash
# Stop all services
docker-compose -f infrastructure/docker-compose.yml down

# Rebuild a specific service
docker-compose -f infrastructure/docker-compose.yml up -d --build admin-api

# View service logs
docker-compose -f infrastructure/docker-compose.yml logs -f tenant-api

# Execute command in container
docker exec -it humanitas-tenant-api sh
```

### Database Commands

```bash
# Connect to master database
psql -h localhost -U humanitas -d humanitas_db

# List all tenant databases
SELECT database_name FROM tenants;

# Connect to a tenant database
psql -h localhost -U humanitas -d tenant_demo_company
```

### Development Commands

```bash
# Run tests (if implemented)
npm test

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

---

## 📊 Database Schema Overview

### Master Database (`humanitas_db`)

```sql
-- Tenants registry
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  slug VARCHAR(50) UNIQUE,
  name VARCHAR(255),
  database_name VARCHAR(100),
  subscription_status VARCHAR(20),
  created_at TIMESTAMP
);

-- Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50)
);
```

### Tenant Database (`tenant_{slug}`)

```sql
-- Employees
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  department VARCHAR(100),
  basic_salary DECIMAL(15,2)
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  work_hours DECIMAL(5,2)
);

-- Payroll runs
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY,
  month INTEGER,
  year INTEGER,
  status VARCHAR(20),
  total_gross DECIMAL(15,2)
);
```

---

## 🐛 Troubleshooting

### Connection Refused

**Problem**: Cannot connect to services

**Solution**:
```bash
# Check if services are running
docker-compose ps

# Restart services
docker-compose down && docker-compose up -d

# Check logs for errors
docker-compose logs
```

### Database Connection Error

**Problem**: `ECONNREFUSED` or `authentication failed`

**Solution**:
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Ensure database exists
- Verify credentials

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change port in .env
```

### Tenant Database Not Created

**Problem**: 404 Tenant not found

**Solution**:
```bash
# Manually create tenant via Admin API
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{ tenant details }'

# Or check logs
docker-compose logs admin-api
```

---

## 📚 Next Steps

1. **Explore the Code**:
   - Start with `backend/tenant-api/src/modules/database/database.service.ts`
   - Review `docs/ARCHITECTURE.md` for deep dive

2. **Read Documentation**:
   - [Architecture Guide](./docs/ARCHITECTURE.md)
   - [ERP Roadmap](./docs/ROADMAP.md)

3. **Try Features**:
   - Create a tenant
   - Add employees
   - Track attendance
   - Run payroll

4. **Customize**:
   - Add your own modules
   - Extend the payroll engine
   - Build custom reports

---

## 💬 Support

For questions or issues with this portfolio project:
- 📧 Email: ymathiasstadesse@gmail.com
- 💼 LinkedIn: [https://linkedin.com/in/mathias-tadesse-96336131a](https://linkedin.com/in/mathias-tadesse-96336131a)
- 🐙 GitHub: [@Mathias-tad](https://github.com/Mathias-tad)

---

**Happy Exploring! 🚀**
