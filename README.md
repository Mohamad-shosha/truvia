# NextRisk AI (TRUVIA)

AI-powered cybersecurity risk management & compliance platform (GRC + SOC + pentest).
This repository currently contains **Foundation + Phase 1: Authentication & RBAC** only.
See [plan.md](plan.md) for the full roadmap.

| Layer | Tech |
|---|---|
| Backend | Java 21, Spring Boot 3.3, Spring Security 6 (JWT resource server), Spring Data JPA, Flyway, springdoc OpenAPI |
| Frontend | React 18, Vite 5, React Router 6, Axios, Vitest + Testing Library |
| Database | MySQL 8 (Docker Compose, named volume, real healthcheck) |

```
nextrisk/
├── backend/            Spring Boot API (+ Dockerfile)
├── frontend/           React SPA
├── docker/             docker-compose.yml, mysql-init/
├── .env.example        placeholders only (real .env is git-ignored)
└── plan.md
```

## Quick start

Prerequisites: Docker Desktop, Node 20+, and either JDK 21 + Maven **or** just Docker (the backend can run/test in containers).

```bash
# 1. configuration (never commit .env)
cp .env.example .env          # then replace EVERY <placeholder>; JWT_SECRET must be >= 32 random chars
cp frontend/.env.example frontend/.env

# 2. database
docker compose --env-file .env -f docker/docker-compose.yml up -d mysql
docker compose --env-file .env -f docker/docker-compose.yml ps        # wait for "healthy"

# 3a. backend on the host (needs JDK 21 + Maven; reads ../.env automatically)
cd backend && mvn spring-boot:run
# 3b. ...or backend in Docker (no JDK needed)
docker compose --env-file .env -f docker/docker-compose.yml --profile app up -d --build

# 4. frontend
cd frontend && npm install && npm run dev      # http://localhost:5173
```

* API: <http://localhost:8080> · Swagger UI: <http://localhost:8080/swagger-ui.html> (disable with `API_DOCS_ENABLED=false`)
* **DB hostnames:** an app running on your *host* uses `localhost:<MYSQL_HOST_PORT>`; an app running *inside Docker* uses the service name `mysql:3306` (compose sets this for the `backend` service). MySQL is published on `127.0.0.1` only.
* Use `http://localhost:5173` (not `127.0.0.1`) in the browser: CORS is an explicit allowlist (`CORS_ALLOWED_ORIGINS`) and the refresh cookie is `SameSite=Strict`.
* Data persists in the named volume `nextrisk_mysql_data` (`docker compose ... down` keeps it; `down -v` deletes it).

### First administrator (no default credentials, no public admin signup)
Public registration only ever creates `ROLE_GRC_ANALYST` users. To provision the first admin, set
`BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` (>= 12 chars) in `.env`, start the backend **once**, then **remove both variables**.
It creates the account only if no `ROLE_ADMIN` exists and the email is unused (it never promotes an existing user).

## Authentication design

| Item | Decision |
|---|---|
| Access token | JWT HS256, 15 min (`JWT_ACCESS_TTL_MINUTES`), claims: `sub` (user id), `iss`, `aud`, `iat`, `exp`, `jti`, `roles`. Signature, expiry, issuer **and audience** validated. Returned in the JSON body; held **in memory only** by the SPA. |
| Refresh token | Opaque 256-bit random value in an **HttpOnly, SameSite=Strict, path=/api/auth** cookie `nr_refresh` (`Secure` via `REFRESH_COOKIE_SECURE`, must be `true` in production). Only its SHA-256 is stored (`refresh_tokens`). |
| Rotation & reuse detection | Every refresh revokes the used token and issues a new one in the same *family*. Replaying a rotated token revokes the whole family. |
| "Remember me" | on: persistent cookie, 30 days (`REFRESH_REMEMBER_TTL_DAYS`); off: session cookie, server-side expiry 12 h (`REFRESH_SESSION_TTL_HOURS`). |
| Reload behaviour | Access token is lost on reload; the SPA silently calls `/api/auth/refresh` to restore the session (protected content is not rendered until this resolves). |
| CSRF | Bearer endpoints are not cookie-authenticated. The only cookie-authenticated endpoints (`refresh`, `logout`) require header `X-Requested-With: XMLHttpRequest` (not sendable cross-origin without CORS approval), plus `SameSite=Strict` and an explicit CORS allowlist. Spring's CSRF filter is therefore disabled by design. |
| Logout | Server-side: revokes the refresh family and clears the cookie. **The already-issued access token remains valid until it expires (<= 15 min)** because access tokens are stateless. The UI states plainly when the server could not be reached. |
| Passwords | BCrypt (strength 12), 10–64 chars, >= 1 letter and 1 digit. |
| Errors | Uniform JSON envelope; login failures (unknown email / wrong password / disabled account) are indistinguishable. |

## API (all JSON)

| Method & path | Auth | Success | Failure |
|---|---|---|---|
| `POST /api/auth/register` `{fullName,email,password}` | public | `201` `{id,fullName,email,roles}` (does **not** sign in) | `400` validation (`fieldErrors`) incl. any unknown field such as `roles`; `409` duplicate email |
| `POST /api/auth/login` `{email,password,rememberMe}` | public | `200` `{accessToken,tokenType,expiresIn,user}` + `Set-Cookie: nr_refresh` | `400`, `401` generic |
| `POST /api/auth/refresh` | cookie + `X-Requested-With` | `200` same body as login, rotated cookie | `401` (cookie cleared), `403` missing header |
| `POST /api/auth/logout` *(addition to the original list)* | cookie + `X-Requested-With` | `204`, cookie cleared, family revoked | `403` missing header |
| `GET /api/auth/me` | Bearer | `200` `{id,fullName,email,roles}` | `401` |
| `GET /api/admin/ping` *(RBAC probe, no business logic)* | Bearer + `ROLE_ADMIN` | `200` | `401` / `403` |

Full request/response schemas, validation rules and examples: Swagger UI.

## Database (Flyway is the source of truth; Hibernate only *validates*)
`V1` users / roles / user_roles · `V2` seed the five roles (`INSERT IGNORE`, idempotent; no users seeded) · `V3` refresh_tokens.
Emails are stored trimmed + lower-cased and the database enforces it (`UNIQUE` + `CHECK`). Never edit an applied migration; add a new `V<n>__*.sql`.

Roles: `ROLE_ADMIN`, `ROLE_CISO`, `ROLE_GRC_ANALYST` (default for self-registration), `ROLE_SOC_ANALYST`, `ROLE_PENTESTER`.

## Tests

```bash
# Frontend (Vitest): validation, API client (refresh/single-flight/expiry), Login/Register, guards, profile, logout, role nav
cd frontend && npm test && npm run build

# Backend integration tests need the MySQL container (they use the isolated schema `nextrisk_test`,
# created automatically on first volume init by docker/mysql-init). With JDK + Maven on the host:
cd backend && DB_USER=... DB_PASSWORD=... mvn test        # DB_HOST/DB_PORT default to localhost:3306

# Without a local JDK, run Maven in a container on the compose network:
docker run --rm --network nextrisk_default -v "$PWD/backend":/app -w /app \
  -e DB_HOST=mysql -e DB_USER -e DB_PASSWORD maven:3.9-eclipse-temurin-21 mvn -B test
```
If your MySQL volume pre-dates `mysql-init`, create the schema once:
`CREATE DATABASE nextrisk_test; GRANT ALL ON nextrisk_test.* TO '<MYSQL_USER>'@'%';`

## Known limitations (intentional, out of scope for this slice)
* No rate limiting / account lockout on login, no email verification, no password reset (the "Forgot password" link says so honestly).
* Expired refresh-token rows are not purged automatically (`RefreshTokenService.purgeExpired()` exists but is not scheduled).
* Access tokens cannot be revoked before expiry (stateless by design).
* The language switcher from the design mockup is not implemented (no i18n yet).

