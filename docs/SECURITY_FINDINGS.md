# NextRisk AI (TRUVIA) — Security Audit & Findings Report

**Document Version:** 1.0.0  
**Audit Date:** October 21, 2026  
**Auditor Classification:** Lead Security Architect & QA  
**Scope:** Authorized local repository code, configuration templates, and running MVP containers.  

---

## 1. Executive Security Assessment

The Phase 1 Authentication Core MVP demonstrates a mature, defense-in-depth security posture designed with strict adherence to OWASP recommendations:
- **Stateless Bearer Access Tokens:** Kept strictly in client memory, eliminating XSS token exfiltration via `localStorage`.
- **Opaque Refresh Tokens with Theft Detection:** Cryptographically random 256-bit strings stored only as SHA-256 digests in MySQL. Single-use rotation with full-family revocation upon replaying a spent token.
- **CSRF Defense Matrix:** Cookie-bearing endpoints mandate `X-Requested-With: XMLHttpRequest`, `SameSite=Strict` cookie enforcement, and an explicit CORS origin allowlist with wildcard prohibition.
- **Password Protection:** Enforced BCrypt strength 12 with character complexity rules.
- **Anti-Enumeration:** Uniform error messaging on login failures to protect against user enumeration.

---

## 2. Security Findings Inventory

| Finding ID | Severity | Category | Target Component | Status | Production Blocking? |
|---|---|---|---|---|---|
| **SEC-001** | MEDIUM | Resource Exhaustion / Hygiene | Refresh Token Storage | OPEN | NO (Phase 1 MVP) / YES (Production) |
| **SEC-002** | MEDIUM | Abuse Prevention | Auth Endpoints Rate Limiting | OPEN | NO (Phase 1 MVP) / YES (Production) |
| **SEC-003** | LOW | Cryptographic Architecture | Token Signing Algorithm | ACCEPTABLE | NO |
| **SEC-004** | LOW | Informational Leakage | Server Version Headers | OPEN | NO |
| **SEC-005** | LOW | Self-Service Recovery | Password Reset Flow | PLANNED | NO |
| **SEC-006** | INFORMATIONAL | Secret Management | Environment Variables | VERIFIED SECURE | NO |

---

## 3. Detailed Finding Descriptions

### SEC-001: Absence of Automated Execution for Expired Refresh Token Purging
- **Severity:** MEDIUM
- **Location:** `backend/src/main/java/com/nextrisk/auth/service/RefreshTokenService.java:95-97`
- **Evidence:**
  ```java
  @Transactional
  public int purgeExpired() {
      return repository.deleteExpiredBefore(Instant.now().minus(Duration.ofDays(1)));
  }
  ```
  The method `purgeExpired()` is implemented, but there is no `@Scheduled` cron trigger or Spring `@EnableScheduling` annotation anywhere in the backend to invoke it periodically.
- **Potential Impact:** Over long periods of production operation, revoked and expired tokens will accumulate in the `refresh_tokens` table, leading to database bloat.
- **Remediation:** Add `@EnableScheduling` to `NextRiskApplication` (or a dedicated `SchedulingConfig`) and configure a daily `@Scheduled(cron = "0 0 3 * * ?")` execution.

---

### SEC-002: Lack of Rate Limiting / Brute-Force Throttling on Authentication Endpoints
- **Severity:** MEDIUM
- **Location:** `backend/src/main/java/com/nextrisk/auth/controller/AuthController.java`
- **Evidence:** `/api/auth/login` and `/api/auth/register` endpoints do not utilize Bucket4j, Spring Cloud Gateway, or Nginx `limit_req` directives.
- **Potential Impact:** An attacker can perform automated high-volume credential stuffing or brute-force dictionary attacks against user accounts.
- **Remediation:** Introduce an IP/Account-based rate limiter (e.g. Bucket4j or Nginx `limit_req_zone` in production reverse proxy) limiting login attempts to 5 per minute per IP.

---

### SEC-003: Symmetric HS256 Secret vs. Asymmetric RS256/ES256 Keypairs
- **Severity:** LOW
- **Location:** `backend/src/main/java/com/nextrisk/config/SecurityConfig.java:104-126`
- **Evidence:** Nimbus JWT encoder and decoder use a shared symmetric secret (`HmacSHA256`) defined via `JWT_SECRET`.
- **Potential Impact:** In a monolithic backend architecture, HS256 is cryptographically secure and standard. However, if microservices or independent resource servers are introduced in Phase 8, distributing the symmetric secret creates key exposure risks.
- **Remediation:** Consider migrating to asymmetric RS256/ES256 keypairs with public key exposure via a JWKS endpoint before Phase 8.

---

### SEC-004: Default Nginx Server Version Header Emission
- **Severity:** LOW
- **Location:** `frontend/nginx.conf`
- **Evidence:** The Nginx reverse proxy configuration does not specify `server_tokens off;`.
- **Potential Impact:** HTTP response headers reveal the exact Nginx version running inside the container to scanners.
- **Remediation:** Add `server_tokens off;` to the `http` or `server` block in `frontend/nginx.conf`.

---

### SEC-005: Absence of Self-Service Password Reset Mechanism
- **Severity:** LOW
- **Location:** `frontend/src/pages/auth/LoginPage.jsx:134-136`
- **Evidence:** Clicking "Forget Password ?" triggers:
  ```jsx
  <Alert variant="info">Self-service password reset is not available yet. Please contact your administrator.</Alert>
  ```
- **Potential Impact:** Operational overhead requiring administrator intervention for forgotten credentials.
- **Remediation:** Implement secure password reset with time-limited cryptographic reset tokens sent via email (Planned for Phase 1 extension / Phase 8).

---

### SEC-006: Environment Secrets & Configuration Safety Inspection
- **Severity:** INFORMATIONAL (Passed Verification)
- **Evidence:**
  1. `.gitignore` strictly excludes `.env` and `.env.*` while preserving `.env.example`.
  2. Git history contains zero committed production secrets or hardcoded passwords.
  3. `SecurityProperties.java` validates that `JWT_SECRET` is at least 32 characters long at startup; backend fails fast if empty or weak.
  4. Database user passwords in Docker are parameterized.
