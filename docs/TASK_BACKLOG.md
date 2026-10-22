# NextRisk AI (TRUVIA) — Comprehensive Master Task Backlog

**Document Version:** 2.0.0  
**Date:** October 2026  
**Lead Architect:** Mohamed Shosha  
**Format:** Structured for Jira / Linear Project Management Migration (96 Granular Tasks across 10 Sprints)  

---

## 1. Priority Scale
- **P0 (Critical / Blocker):** Core architectural, security, or foundational capabilities required for platform viability.
- **P1 (High):** Primary business module functionality required for minimal viable operation of that module.
- **P2 (Medium):** Advanced capabilities, workflow automation, enhanced visualizations, or usability features.
- **P3 (Low):** Nice-to-have optimizations, cosmetic enhancements, or non-critical extensions.

## 2. Effort Scale
- **S (Small):** 1–2 development days.
- **M (Medium):** 3–5 development days.
- **L (Large):** 1–2 development weeks.
- **XL (Extra Large):** 2–4 development weeks.

---

## 3. Sprint-by-Sprint Master Task Breakdown

### Phase 0: Monorepo & Environment Initialization (Sprint 0 (Foundation))
**Milestone Goal:** Establish containerized development environment, multi-tier project scaffolding, MySQL 8 with persistent volumes, and healthcheck orchestration.  
**Sprint Status:** `100% COMPLETE & VERIFIED`  

| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|---|---|
| **INFRA-001** | **Repository Architecture Scaffolding**<br>_Created monorepo layout (backend/, frontend/, docker/, docs/)._ | DevOps | P0 | S | DONE | None |
| **INFRA-002** | **MySQL 8 Containerization with Healthcheck**<br>_Configured MySQL 8.0 container with mysqladmin ping healthcheck and persistent volumes._ | Database | P0 | S | DONE | INFRA-001 |
| **INFRA-003** | **Spring Boot 3.3.5 Backend Scaffolding**<br>_Configured Java 21 / Maven project with Web, JPA, Security, Lombok, and Flyway dependencies._ | Backend | P0 | M | DONE | INFRA-001 |
| **INFRA-004** | **React 18 / Vite 5.4 Frontend Scaffolding**<br>_Initialized modern React 18 SPA with Vite, React Router 6, Vitest, and testing library._ | Frontend | P0 | M | DONE | INFRA-001 |
| **INFRA-005** | **Full-Stack Docker Compose Orchestration**<br>_Docker Compose wiring db:3306, backend:8080, and frontend:5173 with automatic service dependency._ | DevOps | P0 | M | DONE | INFRA-002..004 |
| **INFRA-006** | **Environment Templates & Validation**<br>_Established .env.example templates and isolated secrets from version control._ | Security | P0 | S | DONE | None |

#### 🎯 Deliverables & Outputs after Phase 0 (Sprint 0 (Foundation))
At the conclusion of Sprint 0, the site provides a fully automated, containerized local hosting environment where frontend, backend, and database interact seamlessly via Docker Compose.

**UI & Pages:**
- Vite 5.4 dev server running at http://localhost:5173 with hot module reloading
- App shell baseline with route placeholders and automated Vitest suite (36 tests passing)
- Nginx reverse proxy container ready for production artifact bundling

**Backend & APIs:**
- Spring Boot 3.3.5 REST API running at http://localhost:8080 with Hikari connection pool
- MySQL 8.0 container running on ports 3306/3307 with automated mysqladmin healthchecks
- Flyway migration pipeline initialized and validating schema on startup

**Business Impact:** Zero-friction developer onboarding: any engineer can launch the entire platform stack locally with a single command (docker compose up) without manual database or environment setup.

---

### Phase 1: Security Core, Authentication & RBAC MVP (Sprint 1 (Security MVP))
**Milestone Goal:** Implement production-grade stateless JWT authentication, rotating opaque refresh tokens with theft-detection family revocation, Spring Security 6 filter chain, 5 RBAC roles, and modern React auth UI.  
**Sprint Status:** `87% VERIFIED (20/23 DONE)`  

| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|---|---|
| **DB-001** | **Flyway V1 & V2: Roles and Schema Seeding**<br>_V1 base schema and V2 seed script for 5 enterprise RBAC roles._ | Database | P0 | S | DONE | INFRA-002 |
| **DB-002** | **Flyway V1: Users & User-Roles Tables**<br>_Established users, roles, and user_roles junction tables with unique constraints._ | Database | P0 | S | DONE | DB-001 |
| **DB-003** | **Flyway V3: Refresh Tokens & Family Chain**<br>_Created refresh_tokens table with token_hash, family_id, replaced_by, and revoked_at._ | Database | P0 | S | DONE | DB-002 |
| **BE-AUTH-001** | **User Self-Registration Endpoint**<br>_POST /api/auth/register with BCrypt 10 password hashing and default role assignment._ | Backend | P0 | M | DONE | DB-002 |
| **BE-AUTH-002** | **User Login & Authentication Manager**<br>_POST /api/auth/login validating credentials and returning short-lived JWT access token._ | Backend | P0 | M | DONE | DB-002 |
| **BE-AUTH-003** | **Stateless JWT Issuance & Nimbus Validation**<br>_15-minute HS256 JWT access tokens containing user ID, username, and role authorities._ | Security | P0 | M | DONE | BE-AUTH-002 |
| **BE-AUTH-004** | **Opaque Refresh Token Rotation & Theft Detection**<br>_POST /api/auth/refresh rotating single-use refresh tokens; revokes entire family on replay._ | Security | P0 | M | DONE | DB-003 |
| **BE-AUTH-005** | **Server-Side Logout & Family Revocation**<br>_POST /api/auth/logout revoking active refresh token family and clearing HttpOnly cookie._ | Backend | P0 | S | DONE | BE-AUTH-004 |
| **BE-AUTH-006** | **Current User Profile Endpoint (/api/auth/me)**<br>_GET /api/auth/me returning authenticated user identity, email, and granted authorities._ | Backend | P0 | S | DONE | BE-AUTH-003 |
| **BE-AUTH-007** | **Spring Security 6 Stateless Filter Chain & CORS**<br>_Stateless session creation, custom JwtAuthenticationFilter, and explicit CORS config._ | Security | P0 | M | DONE | BE-AUTH-003 |
| **BE-AUTH-008** | **RBAC Enforcement & Admin Probe (/api/admin/ping)**<br>_@PreAuthorize('hasRole("ADMIN")') probe returning 200 OK for admin and 403 Forbidden for non-admin._ | Backend | P0 | S | DONE | BE-AUTH-007 |
| **BE-AUTH-009** | **Safe Bootstrap Admin Provisioning Engine**<br>_Startup runner provisioning default system administrator with deterministic role wiring._ | Security | P1 | S | DONE | BE-AUTH-002 |
| **BE-AUTH-010** | **Automated Scheduled Expired Token Purging**<br>_Purge method implemented in RefreshTokenService; requires @Scheduled cron activation._ | Backend | P2 | S | PARTIAL | BE-AUTH-004 |
| **FE-AUTH-001** | **Login Page & Form Validation**<br>_React login screen with real-time field validation, error banners, and loading state._ | Frontend | P0 | M | DONE | INFRA-004 |
| **FE-AUTH-002** | **Register Page & Form Validation**<br>_React registration screen with password confirmation, complexity checks, and redirect._ | Frontend | P0 | M | DONE | INFRA-004 |
| **FE-AUTH-003** | **Axios Client, Interceptors & Single-Flight Refresh**<br>_Axios interceptor catching 401, queuing concurrent requests, and executing single refresh._ | Frontend | P0 | M | DONE | FE-AUTH-001 |
| **FE-AUTH-004** | **AuthContext Lifecycle & Auto Session Restore**<br>_Context keeping token in memory, restoring session on reload via silent refresh._ | Frontend | P0 | M | DONE | FE-AUTH-003 |
| **FE-AUTH-005** | **Protected Route Guards & Role-Based Access**<br>_ProtectedRoute redirecting unauthenticated users to /login and unauthorized to /403._ | Frontend | P0 | S | DONE | FE-AUTH-004 |
| **FE-AUTH-006** | **User Profile Page (/profile)**<br>_User profile screen showing account metadata, role badges, and active session status._ | Frontend | P1 | S | DONE | FE-AUTH-005 |
| **FE-AUTH-007** | **Admin Access Verification Page (/admin)**<br>_Admin verification dashboard probing /api/admin/ping and displaying RBAC status._ | Frontend | P1 | S | DONE | FE-AUTH-005 |
| **FE-AUTH-008** | **Responsive AppShell & Role-Aware Navigation**<br>_Navigation sidebar and top header dynamically showing navigation links per role._ | Frontend | P1 | M | DONE | FE-AUTH-005 |
| **FE-AUTH-009** | **Self-Service Password Reset Workflow**<br>_Email token verification and self-service password recovery flow._ | Full-Stack | P2 | L | PLANNED | BE-AUTH-002 |
| **FE-AUTH-010** | **Auth Portal Visual Polish / Redesign Realignment**<br>_Visual alignment with high-fidelity corporate reference mockups._ | Frontend | P2 | M | REVIEW | FE-AUTH-001 |

#### 🎯 Deliverables & Outputs after Phase 1 (Sprint 1 (Security MVP))
At the conclusion of Sprint 1, the platform features a complete, enterprise-grade authentication portal where users can register, log in, maintain secure sessions, and access role-restricted resources.

**UI & Pages:**
- Live Login (/login) and Self-Registration (/register) portals with real-time validation and error banners
- Authenticated User Profile screen (/profile) displaying user identity, email, and assigned roles
- Admin RBAC Verification screen (/admin) showing live permission status against backend endpoints
- Role-tailored navigation sidebar and top bar automatically hiding/showing modules based on granted roles
- Client-side protected route guards (/routes/ProtectedRoute) preventing unauthorized access with /403 redirect

**Backend & APIs:**
- Stateless JWT access token issuance (15-min lifetime) with Nimbus HMAC validation
- Single-use rotating refresh tokens stored in HttpOnly, SameSite=Strict cookies with replay theft detection
- Single-flight Axios interceptor queue preventing race conditions during concurrent token refreshes
- Role-Based Access Control enforcing 5 seeded roles: ADMIN, CISO, GRC_ANALYST, SOC_ANALYST, PENTESTER
- Automated system admin bootstrap runner initializing default root credentials safely

**Business Impact:** Zero-trust user identity foundation. Protects all future business modules (risks, vulnerabilities, compliance) from unauthorized access, session hijacking, and brute-force token reuse.

---

### Phase 2: Public Website, Marketing Portal & Landing Pages (Sprint 2 (Public Web Presence))
**Milestone Goal:** Build the complete public-facing web experience that visitors see when visiting the domain: Home Page, Services, About Us, Pricing, Contact Us, and Demo Request.  
**Sprint Status:** `READY TO COMMENCE — HIGH PRIORITY`  

| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|---|---|
| **FE-NAV-001** | **Public Sticky Header & Responsive Navbar**<br>_Navbar with Logo, navigation links, ThemeToggle, and 'Sign In' / 'Get Started' action buttons._ | Frontend | P0 | M | PLANNED | INFRA-004 |
| **FE-FOOT-001** | **Global Public Footer & Sitemap Component**<br>_Footer with product links, company overview, newsletter signup, and copyright notice._ | Frontend | P0 | S | PLANNED | INFRA-004 |
| **FE-HOME-001** | **Home Page: Hero Section & Action CTAs**<br>_Impactful Hero with cybersecurity badge, bold value statement, 'Start Free Trial' and 'Book Demo' CTAs._ | Frontend | P0 | M | PLANNED | FE-NAV-001 |
| **FE-HOME-002** | **Home Page: Core Security Solutions Grid**<br>_4 Interactive cards showcasing GRC, SOC, Pentest Ingestion, and Predictive AI with hover micro-animations._ | Frontend | P0 | M | PLANNED | FE-HOME-001 |
| **FE-HOME-003** | **Home Page: Interactive Live Risk Calculator Widget**<br>_Client-side interactive widget letting visitors adjust sliders and preview live risk score calculation in real time._ | Frontend | P1 | M | PLANNED | FE-HOME-002 |
| **FE-HOME-004** | **Home Page: Metrics Counter & Testimonials**<br>_Animated statistics bar (e.g. 70% Faster Audits, 99.9% Uptime) and executive quote carousel._ | Frontend | P1 | S | PLANNED | FE-HOME-002 |
| **FE-SERV-001** | **Dedicated Services & Solutions Page (/services)**<br>_Comprehensive solutions page with deep dives into GRC automation, live SOC telemetry, and AI playbooks._ | Frontend | P0 | M | PLANNED | FE-NAV-001 |
| **FE-ABOUT-001** | **About Us & Leadership Page (/about)**<br>_Mission, vision, technology stack badges, and Leadership Architect profile for Mohamed Shosha._ | Frontend | P1 | M | PLANNED | FE-NAV-001 |
| **FE-PRICE-001** | **Pricing & Subscription Plans Page (/pricing)**<br>_3-tier pricing cards (Community, Professional, Enterprise) with monthly/annual toggle and feature matrix._ | Frontend | P1 | M | PLANNED | FE-NAV-001 |
| **FE-CONT-001** | **Contact Us & Inquiry Form Page (/contact)**<br>_Interactive contact form with real-time validation, business email checks, and direct support info._ | Frontend | P0 | M | PLANNED | FE-NAV-001 |
| **FE-DEMO-001** | **Book a Live Product Demo Modal & Scheduler**<br>_Interactive modal allowing prospects to select date/time and request an architectural walkthrough._ | Frontend | P1 | M | PLANNED | FE-CONT-001 |
| **FE-FAQ-001** | **Interactive FAQ Accordion Component**<br>_Smooth expandable accordion answering top questions regarding data privacy, compliance, and AI safety._ | Frontend | P2 | S | PLANNED | FE-CONT-001 |

#### 🎯 Deliverables & Outputs after Phase 2 (Sprint 2 (Public Web Presence))
At the conclusion of Sprint 2, the website features a stunning, world-class public cyber marketing portal. Any visitor can explore platform solutions, test the interactive live risk simulator, view pricing tiers, read company background, and submit demo requests.

**UI & Pages:**
- Public Sticky Navbar with brand crest, navigation links (Home, Services, Pricing, About, Contact), Theme Toggle, and 'Sign In / Register' CTAs
- Home Page (/) featuring Hero banner with dynamic cyber particle effects, feature showcases, and an Interactive Live Risk Simulator slider widget
- Services & Solutions Page (/services) breaking down GRC Automation, SOC Monitoring, Pentest Linking, and AI Remediation
- About Us Page (/about) detailing the mission, engineering philosophy, and leadership profile of Mohamed Shosha
- Pricing Plans Page (/pricing) featuring Community, Starter, and Enterprise tiers with a feature comparison checklist
- Contact Us & Demo Request Page (/contact) with interactive inquiry form, office location info, and interactive FAQ accordion
- Global Responsive Footer with sitemap links, social channels, newsletter subscription, and legal terms

**Backend & APIs:**
- Contact Inquiry & Demo Request API (/api/public/contact) validating and logging prospect leads
- Newsletter Subscription API (/api/public/newsletter) storing email opt-ins
- Public System Status Probe (/api/public/status) providing live platform operational health metrics

**Business Impact:** Transforms the technical backend repository into an attractive, customer-facing SaaS product that inspires confidence, clearly explains the platform value, and converts visitors into registered users.

---

### Phase 3: Asset Inventory & Vulnerability Ingestion (Sprint 3 (Asset & Vuln Core))
**Milestone Goal:** Establish centralized asset repository with classification/criticality tiers, and implement vulnerability finding ingestion with CVSS v3 score parsing.  
**Sprint Status:** `PLANNED`  

| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|---|---|
| **DB-ASSET-001** | **Flyway V4: Asset Entity & Classification Schema**<br>_Create assets table with name, type, classification (Public/Confidential/Restricted), and criticality (Low..Critical)._ | Database | P0 | M | PLANNED | DB-003 |
| **DB-VULN-001** | **Flyway V5: Vulnerabilities & Findings Schema**<br>_Create vulnerabilities table with CVE ID, CVSS v3 base score, severity, remediation status, and asset FK._ | Database | P0 | M | PLANNED | DB-ASSET-001 |
| **BE-ASSET-001** | **Asset Domain Entity, Repository & CRUD APIs**<br>_Spring Boot REST controllers for listing, creating, updating, and archiving organization assets._ | Backend | P0 | M | PLANNED | DB-ASSET-001 |
| **BE-ASSET-002** | **Asset Criticality & Environment Tiering Engine**<br>_Service logic computing asset business value weighting factor based on data classification and environment._ | Backend | P1 | S | PLANNED | BE-ASSET-001 |
| **BE-VULN-001** | **Vulnerability Entity, Repository & CRUD APIs**<br>_REST endpoints for managing vulnerability findings, status tracking (Open/Fixed/Accepted), and asset associations._ | Backend | P0 | M | PLANNED | DB-VULN-001 |
| **BE-VULN-002** | **Pentest Report Ingestion & CVSS v3 Parser**<br>_Service parsing JSON/CSV pentest reports (Nessus/Burp format) and auto-generating vulnerability records._ | Backend | P1 | L | PLANNED | BE-VULN-001 |
| **FE-ASSET-001** | **Asset Inventory Table with Multi-Filter Support**<br>_Interactive React data table supporting filtering by asset type, environment, criticality, and search query._ | Frontend | P0 | M | PLANNED | BE-ASSET-001 |
| **FE-ASSET-002** | **Asset Creation / Edit Modal & Detail View**<br>_Modal drawer with form validation for onboarding assets and viewing linked vulnerability findings._ | Frontend | P1 | M | PLANNED | FE-ASSET-001 |
| **FE-VULN-001** | **Vulnerability & Finding Explorer Dashboard**<br>_Vulnerability explorer view with severity metric cards (Critical/High/Medium/Low) and filterable finding table._ | Frontend | P0 | M | PLANNED | BE-VULN-001 |
| **FE-VULN-002** | **Pentest Report Upload & Ingestion Wizard**<br>_Drag-and-drop file uploader with schema validation, finding preview, and one-click bulk import._ | Frontend | P1 | M | PLANNED | BE-VULN-002 |

#### 🎯 Deliverables & Outputs after Phase 3 (Sprint 3 (Asset & Vuln Core))
At the conclusion of Sprint 3, the site delivers a searchable cyber asset inventory and a vulnerability ingestion portal that turns raw pentest files into actionable technical findings.

**UI & Pages:**
- Interactive Asset Inventory Catalog (/assets) with real-time search, environment filters (Prod/Staging/Dev), and criticality badges
- Asset Creation / Edit Modal Drawer allowing engineers to register new servers, web apps, databases, and cloud services
- Vulnerability Explorer Dashboard (/vulnerabilities) with metric cards showing Critical, High, Medium, and Low findings
- Pentest Ingestion Wizard allowing drag-and-drop file uploads (JSON/CSV) with live parsing preview and bulk import confirmation

**Backend & APIs:**
- RESTful Asset Management APIs (/api/assets) supporting CRUD operations with RBAC permission enforcement
- Asset Criticality Weighting Service calculating organizational impact factors based on data classification tier
- Vulnerability Finding CRUD APIs (/api/vulnerabilities) linking findings directly to affected asset entity IDs
- Automated CVSS v3 Parser ingesting raw scanner reports (Nessus, Burp Suite, OpenVAS) and normalizing vulnerability metrics

**Business Impact:** Eliminates shadow IT and fragmented vulnerability spreadsheets by creating an authoritative single-source inventory of all enterprise IT assets and their active vulnerabilities.

---

### Phase 4: Centralized Risk Register & Dynamic Scoring Engine (Sprint 4 (Risk Engine))
**Milestone Goal:** Build centralized cyber risk register, implement algorithmic live risk scoring model combining assets and vulnerabilities, and construct interactive 5x5 heatmap.  
**Sprint Status:** `PLANNED`  

| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|---|---|
| **DB-RISK-001** | **Flyway V6: Risk Register & Scoring Schema**<br>_Create risks table with title, category, asset FK, inherent/residual scores, live_risk_score, and FAIR exposure ($)._ | Database | P0 | M | PLANNED | DB-VULN-001 |
| **BE-RISK-001** | **Risk Entity, Repository & CRUD APIs**<br>_REST controllers for full risk lifecycle management (Identify, Assess, Treat, Accept, Review)._ | Backend | P0 | M | PLANNED | DB-RISK-001 |
| **BE-RISK-002** | **Dynamic Algorithmic Risk Calculation Engine**<br>_Algorithmic engine: Score = [(Criticality * 0.35) + (CVSS * 0.35) + (Likelihood * 0.20)] * (1 - ControlEff * 0.70)._ | Backend | P0 | L | PLANNED | BE-RISK-001, BE-VULN-001 |
| **BE-RISK-003** | **Financial Exposure Quantification (FAIR Model)**<br>_FAIR framework computation: Annualized Loss Expectancy (ALE) = Single Loss Expectancy (SLE) * ARO ($ USD)._ | Backend | P1 | M | PLANNED | BE-RISK-002 |
| **BE-RISK-004** | **Risk Prioritization Matrix Engine (5x5 Heatmap)**<br>_Matrix aggregation service grouping active risks into 5x5 likelihood/impact coordinates with boundary thresholds._ | Backend | P1 | M | PLANNED | BE-RISK-002 |
| **FE-RISK-001** | **Centralized Risk Register Data Grid & Filtering**<br>_Interactive risk register table with live risk score meter, category filters, owner tags, and status updates._ | Frontend | P0 | M | PLANNED | BE-RISK-001 |
| **FE-RISK-002** | **Interactive 5x5 Risk Heatmap Component**<br>_Visual 5x5 colored grid component with risk count badges, click-to-filter interaction, and cell drill-down._ | Frontend | P1 | M | PLANNED | BE-RISK-004 |
| **FE-RISK-003** | **Risk Creation Wizard with Real-Time Score Preview**<br>_Multi-step risk assessment modal calculating real-time risk score preview as the user adjusts parameters._ | Frontend | P1 | M | PLANNED | BE-RISK-002 |

#### 🎯 Deliverables & Outputs after Phase 4 (Sprint 4 (Risk Engine))
At the conclusion of Sprint 4, the site delivers a full GRC Risk Register with real-time algorithmic risk scoring, an interactive 5x5 heatmap, and quantified financial loss estimation ($ USD).

**UI & Pages:**
- Centralized Risk Register Grid (/risks) displaying risk ID, category, owner, inherent/residual scores, and live risk score meters
- Interactive 5x5 Risk Heatmap Component (Likelihood vs. Impact) with dynamic cell counters and click-to-filter drill-down
- Multi-Step Risk Assessment Wizard with real-time score preview slider responding immediately as parameters change
- Financial Risk Exposure Card displaying FAIR dollar quantification ($ USD) per risk and for the entire organization

**Backend & APIs:**
- Algorithmic Dynamic Scoring Engine computing Live Risk Score (1–100) automatically on every asset/vulnerability update
- FAIR Framework Calculator quantifying Annualized Loss Expectancy (ALE = SLE * ARO) based on business criticality
- Risk Matrix Aggregation API grouping active risks into likelihood/impact coordinates with boundary color coding
- Event listener listening for vulnerability changes and recalculating affected organizational risk scores automatically

**Business Impact:** Transforms abstract technical vulnerability metrics into quantified financial exposure that executive management and board members can immediately understand and prioritize.

---

### Phase 5: Compliance Management & Policy Governance (Sprint 5 (GRC & Compliance))
**Milestone Goal:** Implement multi-framework baseline compliance tracking (ISO 27001, NIST CSF, SOC 2), control assessment checklists, and security policy versioning.  
**Sprint Status:** `PLANNED`  

| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|---|---|
| **DB-COMP-001** | **Flyway V7: Frameworks, Controls & Assessment Schema**<br>_Create compliance_frameworks, controls, and control_assessments tables with audit evidence attachments._ | Database | P0 | M | PLANNED | DB-RISK-001 |
| **DB-POL-001** | **Flyway V8: Policy Governance & Document Versioning**<br>_Create security_policies and policy_revisions tables tracking version, review cycle, and approval state._ | Database | P1 | M | PLANNED | DB-COMP-001 |
| **BE-COMP-001** | **Framework Baseline Seeds (ISO 27001, NIST, SOC 2)**<br>_Seed datasets containing ISO/IEC 27001:2022 clauses, NIST CSF 2.0 categories, and SOC 2 Trust Services Criteria._ | Backend | P0 | M | PLANNED | DB-COMP-001 |
| **BE-COMP-002** | **Compliance Score Calculation Engine (% Progress)**<br>_Service aggregating control implementation status into percentage compliance score per framework._ | Backend | P0 | M | PLANNED | BE-COMP-001 |
| **BE-COMP-003** | **Control Assessment & Audit Evidence Upload API**<br>_REST endpoints for assessing controls (Compliant/In-Progress/Non-Compliant) and uploading audit evidence files._ | Backend | P1 | M | PLANNED | BE-COMP-001 |
| **BE-POL-001** | **Security Policy Repository & Lifecycle Workflow**<br>_REST APIs managing policy lifecycle state machine: DRAFT -> UNDER_REVIEW -> APPROVED -> RETIRED._ | Backend | P1 | M | PLANNED | DB-POL-001 |
| **BE-POL-002** | **Policy Document Versioning & Secure Storage**<br>_Storage service managing version increments, change logs, and secure document attachments._ | Backend | P2 | M | PLANNED | BE-POL-001 |
| **FE-COMP-001** | **Compliance Posture Radial Gauges & Overview**<br>_Compliance dashboard with radial progress meters for ISO 27001, NIST CSF, and SOC 2 posture._ | Frontend | P0 | M | PLANNED | BE-COMP-002 |
| **FE-COMP-002** | **Control Assessment Checklist & Evidence Modal**<br>_Interactive checklist interface allowing auditors to update control statuses and view evidence._ | Frontend | P1 | M | PLANNED | BE-COMP-003 |
| **FE-POL-001** | **Security Policy Document Reader & Version History**<br>_Markdown document reader displaying active corporate security policies with revision history timeline._ | Frontend | P1 | M | PLANNED | BE-POL-001 |

#### 🎯 Deliverables & Outputs after Phase 5 (Sprint 5 (GRC & Compliance))
At the conclusion of Sprint 5, the platform provides continuous compliance tracking across major frameworks and a policy governance repository with version history.

**UI & Pages:**
- Compliance Posture Dashboard (/compliance) featuring radial progress gauges for ISO/IEC 27001, NIST CSF 2.0, and SOC 2 Type II
- Control Assessment Checklist allowing auditors to evaluate controls (Compliant, In-Progress, Non-Compliant) with evidence badges
- Audit Evidence Upload Modal allowing compliance teams to attach PDF/screenshot verification proofs to specific controls
- Security Policy Repository & Document Reader (/policies) displaying company policies in markdown with version change history

**Backend & APIs:**
- Preloaded framework baseline seeds for ISO 27001:2022 clauses, NIST CSF categories, and SOC 2 Trust Criteria
- Automated Compliance Percentage Engine aggregating control statuses into real-time readiness scores
- Audit Evidence Storage Service handling secure file uploads, hashing, and link associations with controls
- Policy Lifecycle State Machine managing document status workflows (Draft -> Under Review -> Approved -> Retired)

**Business Impact:** Replaces manual audit spreadsheets with continuous, real-time audit readiness, cutting external audit prep time by up to 70%.

---

### Phase 6: Security Incident Management & Workflow Automation (Sprint 6 (SOC Operations))
**Milestone Goal:** Build security incident triage board, state machine tracking containment SLAs, and automated alerting for critical risk threshold breaches.  
**Sprint Status:** `PLANNED`  

| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|---|---|
| **DB-INC-001** | **Flyway V9: Incidents, Timeline & Alerting Schema**<br>_Create incidents, incident_timeline, and notification_events tables with severity and SLA deadlines._ | Database | P0 | M | PLANNED | DB-RISK-001 |
| **BE-INC-001** | **Incident Entity, Repository & State Machine**<br>_REST controller and state machine enforcing transitions: REPORTED -> TRIAGED -> CONTAINMENT -> RESOLVED._ | Backend | P0 | M | PLANNED | DB-INC-001 |
| **BE-INC-002** | **Incident-to-Asset/Risk Correlation API**<br>_Correlation service linking incoming security incidents directly to registered assets and open risks._ | Backend | P1 | M | PLANNED | BE-INC-001, BE-RISK-001 |
| **BE-NOTIF-001** | **Critical Risk Threshold Alert Dispatcher**<br>_Event listener firing real-time notifications when a risk exceeds critical score threshold or incident SLA breaches._ | Backend | P1 | M | PLANNED | BE-INC-001, BE-RISK-002 |
| **FE-INC-001** | **Incident Triage Board (Kanban / List with SLAs)**<br>_Kanban drag-and-drop / filterable list view showing active incidents, severity badges, and countdown timers._ | Frontend | P0 | M | PLANNED | BE-INC-001 |
| **FE-INC-002** | **Incident Timeline & Containment Audit Log Screen**<br>_Detailed incident view showing root cause analysis, containment checklist, and chronological audit log._ | Frontend | P1 | M | PLANNED | BE-INC-002 |
| **FE-NOTIF-001** | **Real-Time Notification Center & Alert Banner**<br>_Header notification bell with unread badge counter, alert dropdown, and toast notification popups._ | Frontend | P1 | M | PLANNED | BE-NOTIF-001 |

#### 🎯 Deliverables & Outputs after Phase 6 (Sprint 6 (SOC Operations))
At the conclusion of Sprint 6, the site offers an operational SOC Incident Triage Center with SLA countdown clocks, containment audit logging, and in-app alert notifications.

**UI & Pages:**
- Incident Triage Kanban Board (/incidents) organizing active cases across Reported, Triaged, Containment, and Resolved columns
- SLA Countdown Clocks with visual warning colors (Yellow/Red) alerting responders when breach windows approach
- Incident Detail View showing linked affected assets, risk severity, lead investigator assignment, and containment checklist
- Real-Time Notification Drawer in the header showing unread badge count, high-risk breach alerts, and dismiss controls

**Backend & APIs:**
- Incident Lifecycle State Machine strictly enforcing legal investigation transitions and audit events
- Incident-to-Asset and Risk Correlation Engine mapping active attacks directly to registered infrastructure
- Critical Risk Alert Dispatcher firing asynchronous notifications whenever live risk scores breach critical thresholds
- Immutable Chronological Audit Timeline tracking every action taken during incident triage and containment

**Business Impact:** Drastically reduces Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR), ensuring organizational accountability and compliance with regulatory breach reporting windows.

---

### Phase 7: AI-Powered Risk Prediction & Intelligent Remediation (Sprint 7 (AI Engine))
**Milestone Goal:** Integrate Spring AI with LLM models for automated threat vector prediction, customized remediation playbook generation, and executive report synthesis.  
**Sprint Status:** `PLANNED`  

| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|---|---|
| **DB-AI-001** | **Flyway V10: AI Inferences & Playbook Caching**<br>_Create ai_inferences and remediation_playbooks tables with prompt hashes and cached responses._ | Database | P1 | M | PLANNED | DB-INC-001 |
| **BE-AI-001** | **Spring AI / LLM Client Provider Integration**<br>_Integrate Spring AI framework supporting OpenAI / Gemini / Ollama with token budgeting and retry resilience._ | Backend | P1 | L | PLANNED | DB-AI-001 |
| **BE-AI-002** | **Threat Vector Prediction Engine**<br>_LLM reasoning service analyzing system asset combinations and open CVEs to predict likely attack paths._ | Backend | P1 | L | PLANNED | BE-AI-001, BE-RISK-002 |
| **BE-AI-003** | **Step-by-Step Remediation Playbook Generator**<br>_Prompt engineering engine generating actionable engineering remediation steps for specific risks and CVEs._ | Backend | P1 | L | PLANNED | BE-AI-001, BE-VULN-001 |
| **BE-AI-004** | **Executive Summary Narrative Generator**<br>_Automated generator synthesizing high-level narrative risk insights for CISO and board presentations._ | Backend | P2 | M | PLANNED | BE-AI-001 |
| **FE-AI-001** | **NextRisk AI Copilot Panel in Risk/Vuln Views**<br>_Slide-over AI Assistant drawer allowing analysts to ask questions and generate remediation suggestions._ | Frontend | P1 | M | PLANNED | BE-AI-003 |
| **FE-AI-002** | **Remediation Action Plan Modal & Task Tracker**<br>_Interactive modal displaying generated playbook steps with copyable CLI commands and completion checkboxes._ | Frontend | P1 | M | PLANNED | FE-AI-001 |

#### 🎯 Deliverables & Outputs after Phase 7 (Sprint 7 (AI Engine))
At the conclusion of Sprint 7, the site features an intelligent AI Copilot that forecasts likely attack vectors and generates actionable, step-by-step remediation playbooks for active risks.

**UI & Pages:**
- NextRisk AI Copilot Panel embedded as a slide-over drawer in both the Risk Register and Vulnerability Explorer views
- One-Click 'Generate Remediation Playbook' button producing customized mitigation procedures tailored to the asset stack
- Remediation Action Plan Modal featuring copyable CLI commands, configuration patches, and task completion checkboxes
- Predictive Threat Alerts Banner warning security teams of high-probability attack chains across connected assets

**Backend & APIs:**
- Spring AI Integration Layer connecting to OpenAI / Gemini / Local LLMs with token budgeting and resilience retries
- Threat Vector Prediction Engine analyzing asset topologies and open CVE combinations to forecast breach paths
- Remediation Playbook Generation Service utilizing structured prompt templates to produce deterministic engineering fixes
- AI Inference Caching Layer avoiding redundant model invocations and storing generated recommendations in MySQL

**Business Impact:** Multiplies security team efficiency by transforming raw vulnerability alerts into verified, copy-paste engineering remediation scripts in seconds instead of hours of manual research.

---

### Phase 8: Executive & Security Dashboards + Reporting (Sprint 8 (Executive Insights))
**Milestone Goal:** Build CISO executive overview, real-time SOC operations feed, and automated board-ready PDF/CSV compliance report export.  
**Sprint Status:** `PLANNED`  

| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|---|---|
| **BE-DASH-001** | **Executive KPI Aggregation API (Org Risk, Exposure)**<br>_REST endpoint providing aggregated metrics: Overall Score (0-100), Total Financial Exposure ($), MTTR._ | Backend | P0 | M | PLANNED | BE-RISK-003, BE-COMP-002 |
| **BE-DASH-002** | **SOC Operational Telemetry & Alert Stream API**<br>_Live operational stream endpoint returning active alerts, affected assets, and critical open findings._ | Backend | P1 | M | PLANNED | BE-INC-001 |
| **BE-REP-001** | **Automated PDF / CSV Board Report Generator**<br>_Backend service compiling executive summaries, risk registers, and compliance postures into downloadable PDF/CSV._ | Backend | P1 | L | PLANNED | BE-DASH-001 |
| **FE-DASH-001** | **Executive CISO Dashboard (Exposure, Posture, Trends)**<br>_CISO dashboard featuring financial exposure gauge, top 5 critical risks, compliance dials, and trend graphs._ | Frontend | P0 | L | PLANNED | BE-DASH-001 |
| **FE-DASH-002** | **SOC Real-Time Operations Monitoring Feed**<br>_Real-time SOC monitoring interface with live threat alerts, asset status indicators, and incident ticker._ | Frontend | P1 | M | PLANNED | BE-DASH-002 |
| **FE-REP-001** | **Instant Export & Board-Ready PDF Download UI**<br>_One-click export modal allowing executives to download high-resolution board reports and raw audit spreadsheets._ | Frontend | P1 | M | PLANNED | BE-REP-001 |

#### 🎯 Deliverables & Outputs after Phase 8 (Sprint 8 (Executive Insights))
At the conclusion of Sprint 8, the platform delivers dual-view executive and operational dashboards, and one-click board-ready PDF report downloads.

**UI & Pages:**
- Executive CISO Dashboard (/dashboard/executive) featuring overall posture score, financial risk gauge ($ USD), top 5 risks, and trends
- SOC Real-Time Operational View (/dashboard/soc) with live telemetry stream, incident ticker, and asset health status indicators
- Instant Report Export Modal allowing users to generate and download comprehensive board reports and raw audit spreadsheets
- Interactive posture graphs and historical trend charts showing risk reduction trajectory over time

**Backend & APIs:**
- Executive KPI Aggregation Endpoint providing sub-second summary metrics for board presentations
- SOC Telemetry Stream API delivering real-time incident counters, Mean Time to Remediate (MTTR), and active alerts
- High-Resolution PDF / CSV Report Generation Service compiling charts, registers, and compliance statuses into downloadable files
- Role-based dashboard routing automatically landing CISOs on the executive view and SOC analysts on the operational view

**Business Impact:** Equips the CISO and executive leadership with crisp, financially quantified metrics for board meetings and regulatory filings, proving ROI on security investments.

---

### Phase 9: System Hardening, Audit Logs & Production Readiness (Sprint 9 (Production Readiness))
**Milestone Goal:** Implement immutable activity audit logging, query optimization, rate limiting, asymmetric token signing, and automated CI/CD pipeline.  
**Sprint Status:** `PLANNED`  

| Task ID | Title & Acceptance Criteria | Subsystem | Priority | Effort | Status | Dependencies |
|---|---|---|---|---|---|---|
| **DB-AUDIT-001** | **Flyway V11: Immutable Audit Trail Schema**<br>_Create audit_logs table storing actor ID, action, entity type, entity ID, client IP, and before/after JSON diffs._ | Database | P0 | M | PLANNED | DB-003 |
| **BE-AUDIT-001** | **AspectJ Audit Logging Interceptor for Sensitive Ops**<br>_AOP interceptor automatically recording all CUD actions across Risk, Asset, and Policy entities._ | Backend | P0 | M | PLANNED | DB-AUDIT-001 |
| **BE-PERF-001** | **Read Query Optimization, Index Tuning & Caching**<br>_Composite indexing on risk score queries, Spring Cache abstraction for static framework seeds._ | Backend | P1 | M | PLANNED | All DB tasks |
| **SEC-HARD-001** | **IP/User Rate Limiting (Bucket4j / Nginx Limits)**<br>_Rate limiting on /api/auth/login and /register (10 requests/minute per IP) to prevent brute-force attacks._ | Security | P0 | M | PLANNED | BE-AUTH-002 |
| **SEC-HARD-002** | **Asymmetric RS256/ES256 Token Signing & JWKS**<br>_Upgrade token signing to RS256 with public JWKS endpoint (/oauth2/jwks) for decoupled verification._ | Security | P2 | M | PLANNED | BE-AUTH-003 |
| **QA-E2E-001** | **End-to-End Automated Browser Tests (Playwright)**<br>_Automated browser test suite validating login, risk creation, heatmap click, and PDF export workflows._ | QA | P1 | L | PLANNED | All FE/BE tasks |
| **DEVOPS-CI-001** | **GitHub Actions Automated Build, Test & Lint CI/CD**<br>_Automated GitHub Actions workflow running Maven verify, Vitest suites, Docker build, and lint checks._ | DevOps | P1 | M | PLANNED | INFRA-005 |

#### 🎯 Deliverables & Outputs after Phase 9 (Sprint 9 (Production Readiness))
At the conclusion of Sprint 9, the platform is fully production-hardened, featuring immutable audit logging, brute-force rate limiting, RS256 token verification, and automated CI/CD pipelines.

**UI & Pages:**
- Audit Trail Explorer (/audit) displaying chronological system events, actor identity, IP address, and JSON before/after state diffs
- Rate Limiting Warning Banners gracefully notifying users when brute-force threshold attempts are exceeded
- Production-optimized, sub-second page transitions across both dark and light modes with zero layout shift
- Cross-browser and responsive mobile/tablet layout certification

**Backend & APIs:**
- AspectJ Audit Interceptor automatically recording all create, update, and delete actions across all core domain entities
- Bucket4j In-Memory Token Bucket Rate Limiter protecting /api/auth/login and /register against brute-force attacks
- Asymmetric RS256 / ES256 Token Signing Architecture with public JWKS discovery endpoint (/oauth2/jwks)
- MySQL composite index optimization delivering sub-second response times across large-scale risk registers
- Automated GitHub Actions CI/CD Pipeline executing Maven test suites, Vitest frontend tests, and Playwright E2E browser tests

**Business Impact:** Provides audit-proof compliance with strict legal and enterprise regulations, and guarantees system resilience, scalability, and automated zero-downtime releases.

---
