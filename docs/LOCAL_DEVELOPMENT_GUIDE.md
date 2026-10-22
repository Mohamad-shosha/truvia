# NextRisk AI (TRUVIA) — Local Development & Operations Guide

**Document Version:** 1.0.0  
**Audit Date:** October 21, 2026  

---

## 1. Prerequisites & Tooling Requirements

| Tool | Recommended Version | Verified in Audit | Notes |
|---|---|---|---|
| **Docker Desktop** | Docker 24+ / Compose v2+ | Docker Engine 28.5.1, Compose v5.0.2 | Required for containerized full-stack run |
| **Node.js** | v20.x or v22.x LTS | Node v24.14.0 (NPM 11.9.0) | Required for local frontend development |
| **Java Development Kit** | OpenJDK 21 LTS | Not on host PATH (Run via container) | Eclipse Temurin 21 inside Docker |
| **Apache Maven** | 3.9+ | Run via Docker container | Packaged in builder containers |
| **Git** | 2.40+ | Git 2.50.0.windows.1 | Feature-branch workflow |

---

## 2. Environment Configuration

### 2.1 File Placement
The project uses `.env` files which are strictly git-ignored:
1. `c:\Users\Mohamed Shosha\Desktop\nextrisk\.env` (Root configuration, read by Docker Compose & Spring Boot)
2. `c:\Users\Mohamed Shosha\Desktop\nextrisk\docker\.env` (Docker directory mirror)
3. `c:\Users\Mohamed Shosha\Desktop\nextrisk\frontend\.env` (Frontend Vite overrides)

### 2.2 Template Variables (.env.example)
```ini
# MySQL Database Container
MYSQL_ROOT_PASSWORD=<strong-random-root-password>
MYSQL_DATABASE=nextrisk
MYSQL_USER=nextrisk
MYSQL_PASSWORD=<strong-random-app-password>
MYSQL_HOST_PORT=3306

# Backend Database Credentials
DB_HOST=mysql
DB_PORT=3306
DB_NAME=nextrisk
DB_USER=nextrisk
DB_PASSWORD=<same-as-MYSQL_PASSWORD>

# JWT Security Settings
JWT_SECRET=<minimum-32-character-secret>
JWT_ISSUER=nextrisk-api
JWT_AUDIENCE=nextrisk-web
JWT_ACCESS_TTL_MINUTES=15

# Security Controls
CORS_ALLOWED_ORIGINS=http://localhost:5173
REFRESH_COOKIE_SECURE=true
API_DOCS_ENABLED=true

# Initial Admin Bootstrap (Optional one-time run)
BOOTSTRAP_ADMIN_EMAIL=
BOOTSTRAP_ADMIN_PASSWORD=
BOOTSTRAP_ADMIN_NAME=Platform Administrator
```

---

## 3. Verified Execution Workflows

### 3.1 Mode A: Full Stack with Docker Compose (Recommended)
This mode launches MySQL 8, the Spring Boot backend, and the React frontend inside unified containers.

```powershell
# From the repository root:
docker compose -f docker/docker-compose.yml up -d

# Verify all services are healthy:
docker compose -f docker/docker-compose.yml ps
```

**Service URLs:**
- Frontend Application: `http://localhost:5173`
- Backend REST API: `http://localhost:8080`
- OpenAPI Swagger UI: `http://localhost:8080/swagger-ui.html`
- MySQL Host Port: `127.0.0.1:3306` (or custom mapped port)

### 3.2 Mode B: Hybrid Local Frontend + Containerized Backend
Used during active UI development with Vite hot module replacement (HMR).

```powershell
# 1. Start MySQL and Backend via Docker
docker compose -f docker/docker-compose.yml up -d mysql backend

# 2. Run React Frontend locally
cd frontend
npm install
npm run dev
```

---

## 4. Verification and Testing Commands

### 4.1 Frontend Test Suite (Vitest)
```powershell
cd frontend
npm test -- --run
```
*Expected Outcome:* 4 test files, 36 tests passing.

### 4.2 Backend Automated Test Suite
When local JDK/Maven is not installed on the Windows host, execute Maven inside a temporary container attached to the Docker network:
```powershell
docker run --rm --network nextrisk_default -v "${PWD}/backend":/app -w /app `
  -e DB_HOST=mysql -e DB_USER=nextrisk -e DB_PASSWORD=SecretPassword `
  maven:3.9-eclipse-temurin-21 mvn test
```
*Expected Outcome:* 5 test classes, 38 integration tests passing against `nextrisk_test`.

### 4.3 API Smoke Testing Script
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\test_api.ps1
```
*Verifies:* Registration, login, duplicate check, /me profile, RBAC admin probe (403 for non-admin), refresh rotation, and logout.

---

## 5. Safe Service Shutdown Procedures

### Safe Pause (Preserves MySQL Data Volume)
```powershell
docker compose -f docker/docker-compose.yml stop
```
*Effect:* Halts container execution. Database tables and registered user accounts remain intact.

### Graceful Teardown (Preserves Data Volume)
```powershell
docker compose -f docker/docker-compose.yml down
```
*Effect:* Removes container instances and networks, but retains the `nextrisk_mysql_data` volume.

### DANGER: Destructive Reset (Data Loss)
```powershell
# WARNING: DO NOT run this unless you explicitly intend to destroy all user and audit data:
docker compose -f docker/docker-compose.yml down -v
```
