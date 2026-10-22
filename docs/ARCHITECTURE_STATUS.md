# NextRisk AI (TRUVIA) — Architecture Status

**Document Version:** 1.0.0  
**Audit Date:** October 21, 2026  
**Status:** Verified Architecture Baseline  

---

## 1. System Vision vs. Current Implementation

NextRisk AI (branded in UI artifacts as TRUVIA) is designed as a unified cyber risk and compliance orchestration platform. It connects three traditionally fragmented cybersecurity pillars:
1. **Governance, Risk, and Compliance (GRC):** Risk register, multi-framework compliance controls (ISO 27001, NIST CSF, SOC 2), and policy governance.
2. **Security Operations Center (SOC):** Real-time incident response, telemetry, and live vulnerability remediation.
3. **Penetration Testing:** Vulnerability ingestion, CVSS assessment, and finding-to-risk correlation.

### Current Implementation State:
- **Phase 0 (Infrastructure & Scaffolding):** Completed and verified.
- **Phase 1 (Security Core & Authentication MVP):** Completed and verified end-to-end.
- **Phases 2 through 8 (Business Modules, AI Engine, Reporting, Hardening):** Fully specified in `plan.md`, not yet implemented.

---

## 2. Architectural Blueprint

### 2.1 Component Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                Client Layer (Browser)                             |
|  React 18.3 SPA (Vite 5.4)                                                       |
|  - AuthContext (In-Memory Access Token Store, Refresh-on-Load)                    |
|  - Axios HTTP Client (Bearer Interceptor, Single-Flight 401 Refresh Queue)        |
|  - Route Guards (PublicOnlyRoute, ProtectedRoute with RBAC)                       |
|  - Views: /login, /register, /profile, /admin, /forbidden, /404                   |
+-----------------------------------------------------------------------------------+
           |                                                      ^
           | REST (JSON) + Authorization: Bearer <JWT>            |
           | Cookie: nr_refresh (HttpOnly, Strict)                | Cookie / JSON
           | Header: X-Requested-With: XMLHttpRequest             |
           v                                                      |
+-----------------------------------------------------------------------------------+
|                           Reverse Proxy / Web Server                              |
|  Nginx Alpine (Docker Port 5173 / Container Port 80)                              |
|  - Static Assets Hosting (HTML/CSS/JS)                                            |
|  - Reverse Proxy: /api/* -> http://backend:8080/api/*                             |
+-----------------------------------------------------------------------------------+
           |
           v Internal Docker Network: nextrisk_default
+-----------------------------------------------------------------------------------+
|                         Application Layer (Spring Boot 3.3.5)                     |
|  Java 21 Virtual Machine                                                          |
|  - Spring Security 6 (Stateless OAuth2 Resource Server)                           |
|  - Nimbus JWT Encoder / Decoder (HS256 with HMAC-SHA256 Secret)                  |
|  - Controllers: AuthController (/api/auth/*), AdminProbeController (/api/admin/*)|
|  - Services: AuthService, RefreshTokenService, RefreshCookieFactory, AdminBootstrap|
|  - Repositories: UserRepository, RoleRepository, RefreshTokenRepository           |
|  - Exception Handling: GlobalExceptionHandler -> ApiError Envelope                |
|  - Documentation: SpringDoc OpenAPI 2.6 -> /swagger-ui.html                       |
+-----------------------------------------------------------------------------------+
           |
           | Spring Data JPA / Hibernate (ddl-auto: validate)
           | Flyway Database Migrations (V1, V2, V3)
           v
+-----------------------------------------------------------------------------------+
|                          Persistence Layer (MySQL 8.0)                            |
|  Docker Container: nextrisk-mysql (Port 127.0.0.1:3306 -> 3306)                  |
|  Persistent Volume: nextrisk_mysql_data                                           |
|  - Database: nextrisk (Production/Dev)                                            |
|  - Database: nextrisk_test (Test harness initialized by 01-test-database.sh)     |
|  - Tables: roles, users, user_roles, refresh_tokens, flyway_schema_history        |
+-----------------------------------------------------------------------------------+
```

---

## 3. Technology Inventory & Module Boundaries

| Component | Target Architecture | Actual Implementation in Repo | Status | Verification Evidence |
|---|---|---|---|---|
| **Backend Framework** | Spring Boot 3.x | Spring Boot 3.3.5, Java 21 | DONE — VERIFIED | `backend/pom.xml`, `mvn -v` / Docker runtime |
| **Security Framework** | Spring Security 6 | OAuth2 Resource Server, stateless JWT | DONE — VERIFIED | `SecurityConfig.java:56-89` |
| **JWT Library** | Nimbus JOSE JWT | `spring-security-oauth2-jose` | DONE — VERIFIED | `SecurityConfig.java:108-126` |
| **Password Hashing** | BCrypt | BCrypt strength 12 (`SecurityProperties`) | DONE — VERIFIED | `SecurityConfig.java:93`, `User.java:34` |
| **Database Migrations** | Flyway | Flyway MySQL 10.x (V1, V2, V3 migrations) | DONE — VERIFIED | `db/migration/V1..V3.sql`, `application.yml:20-22` |
| **ORM / JPA** | Spring Data JPA / Hibernate | Hibernate 6.x (`ddl-auto: validate`) | DONE — VERIFIED | `application.yml:15`, entities in `com.nextrisk.auth.entity` |
| **API Documentation** | OpenAPI 3.0 / Swagger | SpringDoc OpenAPI 2.6.0 (`/swagger-ui.html`) | DONE — VERIFIED | `OpenApiConfig.java`, `pom.xml:59-62` |
| **Frontend Framework** | React 18.x | React 18.3.1 + React DOM | DONE — VERIFIED | `frontend/package.json:17-18` |
| **Build Tooling (FE)** | Vite 5.x | Vite 5.4.21 | DONE — VERIFIED | `frontend/package.json:28` |
| **Routing** | React Router 6 | React Router DOM 6.28.0 | DONE — VERIFIED | `frontend/src/App.jsx`, `guards.jsx` |
| **HTTP Client** | Axios | Axios 1.7.9 with custom interceptors | DONE — VERIFIED | `frontend/src/services/apiClient.js` |
| **Testing (FE)** | Vitest + Testing Library | Vitest 2.1.9, RTL 16.1.0, JSDOM 25.0.1 | DONE — VERIFIED | 36/36 tests passing in `npm test` |
| **Testing (BE)** | JUnit 5 + Spring Security Test | JUnit Jupiter, MockMvc, AssertJ | DONE — VERIFIED | 38 integration tests executed in Maven build |
| **Containerization** | Docker Compose | MySQL 8.0, backend JRE 21, frontend Nginx | DONE — VERIFIED | `docker/docker-compose.yml`, `docker ps` verified |

---

## 4. Current vs. Planned Domain Models

```
+------------------------------------------------------------------------------------+
| DOMAIN MODEL STATUS                                                                |
+------------------------------------------------------------------------------------+
| IMPLEMENTED & VERIFIED (Phase 1):                                                  |
|   - User (id, full_name, email, password_hash, enabled, created_at, updated_at)    |
|   - Role (id, name: ROLE_ADMIN, ROLE_CISO, ROLE_GRC_ANALYST, ...)                  |
|   - UserRoles (user_id, role_id)                                                   |
|   - RefreshToken (id, user_id, token_hash, family_id, remember_me, expires_at, ...) |
+------------------------------------------------------------------------------------+
| PLANNED BUT NOT YET IMPLEMENTED (Phases 2 - 8):                                    |
|   - Phase 2: Asset, Vulnerability, PentestReport                                   |
|   - Phase 3: Risk, RiskScoreHistory, FinancialImpactModel                          |
|   - Phase 4: ComplianceFramework, ComplianceControl, SecurityPolicy, PolicyVersion |
|   - Phase 5: Incident, IncidentTimeline, Notification                              |
|   - Phase 6: AiPrediction, AiRemediationPlaybook, AiAuditLog                       |
|   - Phase 7: ExecutiveReport, DashboardKpiSnapshot                                 |
|   - Phase 8: SystemAuditLog                                                        |
+------------------------------------------------------------------------------------+
```

---

## 5. Architectural Invariants and Non-Negotiable Standards

1. **Schema Authority:** The database schema is strictly managed by versioned Flyway migrations (`db/migration/V*`). Hibernate auto-generation (`ddl-auto: update|create`) is forbidden in all environments.
2. **Zero-Trust Token Separation:**
   - Access tokens are stateless JWTs, short-lived (15 minutes), and kept **in-memory only** on the client.
   - Refresh tokens are opaque 256-bit cryptographic tokens stored as SHA-256 digests in MySQL and transmitted only via `HttpOnly`, `SameSite=Strict`, `path=/api/auth` cookies.
3. **Anti-CSRF Defense:** Cookie-based endpoints (`/api/auth/refresh`, `/api/auth/logout`) mandate the presence of `X-Requested-With: XMLHttpRequest` header, combined with CORS origin allowlisting and SameSite cookies.
4. **Authoritative Server Enforcement:** Frontend route guards (`guards.jsx`) exist exclusively for user experience. The backend evaluates JWT signatures and `@PreAuthorize` permissions on every invocation.
