# 🛡️ NextRisk AI — Comprehensive Implementation Plan

> **NextRisk AI** is an intelligent, unified cybersecurity platform that bridges the gap between **Governance, Risk, and Compliance (GRC)**, **Security Operations (SOC)**, and **Penetration Testing**. It automates risk calculation, compliance tracking, and predictive remediation using AI.

---

## 📌 1. Project Overview & Requirements Mapping

### 1.1 Target Users & Personas
- **CISO & Executive Management**: High-level posture, financial risk quantification, board-level reporting.
- **GRC Analysts & Compliance Officers**: Risk register, compliance frameworks (ISO 27001, NIST CSF, SOC 2), policy lifecycles.
- **SOC Analysts & Security Engineers**: Real-time telemetry, live incident response, dynamic risk score monitoring.
- **Penetration Testers**: Vulnerability tracking, pentest ingestion, technical finding-to-risk mapping.

### 1.2 Functional Requirements (FR) Coverage
| ID | Requirement | Phase |
|---|---|---|
| **FR-01** | Secure User Registration & Authentication (JWT + Spring Security) | Phase 1 |
| **FR-02** | Centralized Risk Register (CRUD, Lifecycle, Ownership) | Phase 3 |
| **FR-03** | Live Risk Score Calculation Engine (Dynamic Algorithmic Scoring) | Phase 3 |
| **FR-04** | AI Risk Prediction & Intelligent Remediation Recommendations | Phase 6 |
| **FR-05** | Compliance Management & Controls (ISO 27001, NIST CSF, SOC 2) | Phase 4 |
| **FR-06** | Security Policy Management & Document Versioning | Phase 4 |
| **FR-07** | Vulnerability Reports & Pentest Ingestion | Phase 2 |
| **FR-08** | Asset Inventory & Criticality Classification | Phase 2 |
| **FR-09** | Executive & Security Operations Dashboards | Phase 7 |
| **FR-10** | Security Incident Management & Response Tracking | Phase 5 |
| **FR-11** | Risk Prioritization Matrix & Business Impact Analysis (BIA) | Phase 3 |
| **FR-12** | Role-Based Access Control (RBAC: Admin, CISO, GRC, SOC, Pentester) | Phase 1 |
| **FR-13** | Notifications & Real-Time Critical Risk Alerts | Phase 5 |
| **FR-14** | Automated Executive & Compliance Reporting (PDF/CSV/Executive Summary) | Phase 7 |

---

## 🏗️ 2. Architecture & Monorepo Structure

```
nextrisk/
├── backend/                  # Spring Boot 3.x (Java 17/21) REST API
│   ├── src/main/java/com/nextrisk/
│   │   ├── config/           # Security, JWT, CORS, OpenAPI, AI client configs
│   │   ├── security/         # UserDetails, JWT Filter, Auth entry points
│   │   ├── auth/             # Authentication & RBAC controllers, services, DTOs
│   │   ├── asset/            # Asset inventory management
│   │   ├── vulnerability/    # Vulnerability & Pentest reporting
│   │   ├── risk/             # Central Risk Register & Dynamic Scoring Engine
│   │   ├── compliance/       # Frameworks (ISO 27001, NIST) & Controls
│   │   ├── policy/           # Security Policy repository & lifecycles
│   │   ├── incident/         # Security Incident Management
│   │   ├── ai/               # AI Risk Prediction & Remediation service
│   │   ├── dashboard/        # Aggregations, metrics, executive KPIs
│   │   ├── notification/     # In-app alerts and notifications
│   │   └── audit/            # Activity audit logging
│   ├── src/main/resources/
│   │   ├── application.yml   # Spring configuration & MySQL connection
│   │   └── db/migration/     # Flyway / SQL schema initialization scripts
│   └── pom.xml
│
├── frontend/                 # React SPA (Vite + Modern UI Design System)
│   ├── src/
│   │   ├── assets/           # Logos, SVGs, static assets
│   │   ├── components/       # Reusable UI (Navbar, Sidebar, Modal, DataTables, Badges)
│   │   ├── context/          # AuthContext, NotificationContext, ThemeContext
│   │   ├── pages/
│   │   │   ├── auth/         # Login, Register, Profile
│   │   │   ├── dashboard/    # Executive Dashboard & SOC Real-Time View
│   │   │   ├── risk/         # Risk Register, Risk Matrix, Risk Scoring
│   │   │   ├── assets/       # Asset Inventory & Criticality
│   │   │   ├── vulnerabilities/ # Vulnerabilities & Pentest findings
│   │   │   ├── compliance/   # Frameworks, Controls & Audit readiness
│   │   │   ├── policies/     # Policies repository & reader
│   │   │   ├── incidents/    # Security Incidents & triage
│   │   │   └── ai-insights/  # AI Risk Predictions & Remediation Advisor
│   │   ├── services/         # Axios / Fetch API client modules
│   │   ├── styles/           # High-end Dark/Light Theme CSS Design System
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── docker/                   # Docker Compose for local development (MySQL 8)
│   └── docker-compose.yml
└── plan.md                   # This master roadmap document
```

---

## 🗄️ 3. Database Schema Overview (MySQL)

1. **`users` & `roles`**: User identity, hashed passwords (BCrypt), RBAC assignments (`ROLE_ADMIN`, `ROLE_CISO`, `ROLE_GRC_ANALYST`, `ROLE_SOC_ANALYST`, `ROLE_PENTESTER`).
2. **`assets`**: Hardware, software, cloud services, data classification (Public, Internal, Confidential, Restricted), business criticality (Low, Medium, High, Critical), owners.
3. **`vulnerabilities`**: CVE ID, CVSS v3 score, title, affected asset ID, severity (Low, Medium, High, Critical), pentest finding reference, remediation status.
4. **`risks`**: Risk ID, title, category (Operational, Cyber, Compliance, Third-Party), asset ID, inherent likelihood & impact, residual likelihood & impact, **live_risk_score**, financial exposure estimate ($), status (Open, Mitigated, Accepted).
5. **`compliance_frameworks` & `controls`**: ISO 27001, NIST CSF, SOC 2, PCI-DSS; controls mapping, implementation status (Compliant, In-Progress, Non-Compliant), audit evidence.
6. **`policies`**: Title, category, version, status (Draft, Under Review, Approved), review date, file storage path.
7. **`incidents`**: Severity, category, affected asset/risk, status (New, Triaged, Investigating, Resolved), timeline, lead investigator.
8. **`ai_predictions` & `recommendations`**: AI inference logs, generated remediation playbooks, confidence score, applied date.
9. **`audit_logs`**: Action performed, user ID, timestamp, target entity, IP address, changes.

---

## 🚀 4. Phased Implementation Roadmap

### 📍 Phase 0: Monorepo & Environment Initialization
- Initialize project repository structure (`backend/`, `frontend/`, `docker/`).
- Setup Docker Compose for **MySQL 8.0** with persistent storage & healthchecks.
- Scaffold **Spring Boot 3** project with Maven, Spring Web, Spring Security, Spring Data JPA, MySQL Connector, Lombok, and validation.
- Scaffold **React** project with Vite, routing, and high-performance design system.

---

### 📍 Phase 1: Security Core, Authentication & RBAC (FR-01, FR-12, NFR-09)
* **Backend:**
  - Database schema: `users`, `roles`, `refresh_tokens`.
  - Spring Security 6 filter chain with Stateless JWT Authentication.
  - Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/refresh`.
  - RBAC authorization decorators (`@PreAuthorize("hasRole('GRC_ANALYST')")`).
* **Frontend:**
  - Modern authentication portal (Login & Register with interactive validation).
  - AuthContext, token storage in memory/secure storage, auto-logout on 401.
  - Role-protected routes and responsive navigation sidebar tailored per user role.

---

### 📍 Phase 2: Asset Inventory & Vulnerability Management (FR-07, FR-08)
* **Backend:**
  - Entities & Repositories: `Asset`, `Vulnerability`, `PentestReport`.
  - Asset management API: CRUD, asset classification, business value scoring.
  - Vulnerability ingestion API: Add/import vulnerabilities, CVSS score parsing, link to assets.
* **Frontend:**
  - Asset Inventory Table with filters (Type, Environment, Criticality score, Owner).
  - Asset detail modal & risk badge.
  - Vulnerabilities & Pentest Findings dashboard with severity breakdowns (Critical/High/Medium/Low).

---

### 📍 Phase 3: Centralized Risk Register & Dynamic Live Risk Scoring Engine (FR-02, FR-03, FR-11)
* **Backend:**
  - `Risk` entity with relations to Assets, Vulnerabilities, and Controls.
  - **Dynamic Live Risk Scoring Engine**:
    $$\text{Score} = f(\text{Asset Criticality}, \text{Vulnerability CVSS}, \text{Threat Likelihood}, \text{Control Effectiveness})$$
    Calculates live 1–100 normalized score + Financial Risk Exposure (FAIR estimation in USD).
  - Automated triggers: recalculates risk score when linked vulnerabilities or controls change.
  - Risk prioritization endpoints: Sort by live score, financial impact, status.
* **Frontend:**
  - Interactive Risk Register table with search, category filters, and live score meters.
  - 5x5 Dynamic Risk Heatmap (Likelihood vs. Impact).
  - Risk creation/editing wizard with real-time score preview.

---

### 📍 Phase 4: Compliance Management & Policy Governance (FR-05, FR-06)
* **Backend:**
  - Preloaded framework seeds: **ISO/IEC 27001:2022**, **NIST CSF 2.0**, **SOC 2 Type II**.
  - `ComplianceControl` & `SecurityPolicy` entities.
  - Calculation of framework compliance percentage score.
  - Policy management: Versioning, status workflows (Draft -> Approved), PDF/document attachments.
* **Frontend:**
  - Compliance Overview page: Radial compliance gauges for ISO 27001, NIST, SOC 2.
  - Control assessment checklist (audit readiness, evidence upload, implementation status).
  - Policy Repository library with previewer and version history.

---

### 📍 Phase 5: Security Incident Management & Workflow Automation (FR-10, FR-13)
* **Backend:**
  - `Incident` entity linking to assets and risks.
  - Workflow state machine: `REPORTED` ➔ `TRIAGED` ➔ `CONTAINMENT` ➔ `RESOLVED`.
  - In-app notification dispatcher for critical risks and high-severity incidents.
* **Frontend:**
  - Incident triage kanban/list board with SLA timers.
  - Incident detail screen with containment checklist and audit timeline.
  - Notification center dropdown with unread badges and audio/visual alert triggers.

---

### 📍 Phase 6: AI-Powered Risk Prediction & Intelligent Remediation (FR-04, FR-14)
* **Backend:**
  - AI Service integration (OpenAI API / Gemini API / Local LLM provider via Spring AI / REST client).
  - Prompts & Agents for:
    1. **Threat Prediction**: Analyzing current asset stack & open CVEs to predict likely attack vectors.
    2. **Intelligent Remediation Engine**: Generating step-by-step mitigation playbooks for active risks.
    3. **Executive Summary Generator**: Synthesizing weekly/monthly risk reports.
  - Cache and audit storage of AI generation results.
* **Frontend:**
  - "NextRisk AI Assistant" panel inside risk and vulnerability views.
  - One-click "Generate AI Remediation Plan" with copyable action steps.
  - Predictive Threat Alerts banner.

---

### 📍 Phase 7: Executive & Security Dashboards + Advanced Reporting (FR-09, FR-14, NFR-01, NFR-02)
* **Backend:**
  - Aggregation endpoints for executive KPIs:
    - Overall Organizational Risk Score (0-100)
    - Total Financial Exposure ($)
    - Compliance posture across frameworks
    - Mean Time to Remediate (MTTR)
  - PDF/CSV report generation service for CISO/Board meetings.
* **Frontend:**
  - **Executive CISO View**: High-level financial exposure gauge, trend charts, top 5 critical risks, compliance posture.
  - **SOC / Technical View**: Live risk feed, open incidents, asset health indicators.
  - Export report module (Instant downloadable board report).

---

### 📍 Phase 8: System Hardening, Audit Logs & Performance (NFR-03 to NFR-10)
- End-to-end Audit Logging for all GRC/Security actions.
- Performance optimization: MySQL indexing, query caching, API response < 3s (NFR-02).
- Final verification of dark/light theme, responsive layout, and cross-browser compatibility.

---

## 🎯 5. Immediate Next Steps & Decision Points

To start building, please confirm:
1. **Approval of the plan above** (or any requested adjustments to the phases).
2. **Phase to start with**: We recommend beginning with **Phase 0 (Monorepo & Docker/DB setup)** followed immediately by **Phase 1 (Spring Boot Backend + React Frontend Auth & Core Foundation)**.

---
*Created for NextRisk AI Graduation Project.*
