"""
NextRisk AI (TRUVIA) — Comprehensive Master Sprint Implementation Plan & Roadmap Generator
Author & Lead Architect: Mohamed Shosha
Date: October 2026
Generates an executive-grade, colorful, print-optimized HTML and compiles it to PDF via Headless Chrome.
Expanded to include Public Website (Home, Services, About, Contact, Pricing) and Full Enterprise App.
"""

import os
import sys
import subprocess
from pathlib import Path

WORKSPACE = Path(r"c:\Users\Mohamed Shosha\Desktop\nextrisk")
HTML_OUTPUT = WORKSPACE / "docs" / "NextRisk_AI_Implementation_Plan_Mohamed_Shosha.html"
PDF_OUTPUT = WORKSPACE / "NextRisk_AI_Master_Roadmap_Mohamed_Shosha.pdf"
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

# Functional Requirements Matrix (Public Website + Enterprise Platform)
FUNCTIONAL_REQUIREMENTS = [
    # Public Web Portal Requirements
    {
        "id": "FR-WEB-01",
        "name": "Public Home & Landing Page",
        "persona": "Visitors / Prospects / All Users",
        "phase": "Phase 2 (Sprint 2)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Modern public landing page with Hero section, security solutions overview, interactive risk simulator widget, live statistics, and registration CTAs.",
        "deliverables": "HomePage.jsx, HeroSection, SolutionsGrid, InteractiveRiskSimulator, Testimonials, Sticky Navbar & Footer."
    },
    {
        "id": "FR-WEB-02",
        "name": "Services & Solutions Showcase Page",
        "persona": "Prospects / CISOs / Auditors",
        "phase": "Phase 2 (Sprint 2)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Detailed public showcase of platform capabilities: GRC Automation, SOC Live Monitoring, Pentest Finding Linking, and AI-Powered Remediation.",
        "deliverables": "ServicesPage.jsx, SolutionCards, ArchitectureDiagramPreview, FeatureDeepDive, Call-to-Action banners."
    },
    {
        "id": "FR-WEB-03",
        "name": "About Us & Architecture Page",
        "persona": "Visitors / Evaluators / Investors",
        "phase": "Phase 2 (Sprint 2)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Company vision, cyber mission statement, technology stack overview (Spring Boot 3, React 18, MySQL 8, Spring AI), and engineering leadership.",
        "deliverables": "AboutPage.jsx, MissionVisionCard, TechStackBadges, ArchitectProfile (Mohamed Shosha), TimelineMilestones."
    },
    {
        "id": "FR-WEB-04",
        "name": "Contact Us & Demo Request Portal",
        "persona": "Clients / Prospective Users",
        "phase": "Phase 2 (Sprint 2)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Interactive contact page with inquiry form, Book a Live Demo calendar scheduler, support contact channels, and interactive FAQ accordion.",
        "deliverables": "ContactPage.jsx, ContactForm, DemoBookingModal, FAQAccordion, OfficeLocationsMap."
    },
    {
        "id": "FR-WEB-05",
        "name": "Pricing & Subscription Plans Page",
        "persona": "Prospective Clients / Buyers",
        "phase": "Phase 2 (Sprint 2)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Transparent pricing tiers (Community, Professional, Enterprise) with monthly/annual billing toggle and full feature comparison matrix.",
        "deliverables": "PricingPage.jsx, TierCards, BillingToggle, FeatureComparisonTable, EnterpriseInquiryCTA."
    },

    # Core Security Platform Requirements
    {
        "id": "FR-01",
        "name": "Secure User Registration & Authentication",
        "persona": "All Users / Security Admin",
        "phase": "Phase 1 (Sprint 1)",
        "status": "DONE — VERIFIED",
        "status_class": "badge-done",
        "desc": "Stateless JWT access tokens with rotating opaque refresh tokens, BCrypt hashing, HttpOnly SameSite=Strict cookies, and auto session restore.",
        "deliverables": "Spring Security 6 filter chain, /api/auth endpoints, React AuthContext, Axios single-flight refresh queue."
    },
    {
        "id": "FR-02",
        "name": "Centralized Risk Register",
        "persona": "GRC Analyst / CISO",
        "phase": "Phase 4 (Sprint 4)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Single source of truth for cybersecurity risks: CRUD lifecycle, categorization, owner assignments, and risk treatment workflows.",
        "deliverables": "Risk domain entities, Flyway V6 schema, interactive data table with multi-criteria filtering, audit history."
    },
    {
        "id": "FR-03",
        "name": "Dynamic Live Risk Scoring Engine",
        "persona": "GRC Analyst / SOC",
        "phase": "Phase 4 (Sprint 4)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Algorithmic live scoring combining asset criticality, CVSS v3 findings, threat likelihood, and compensating control effectiveness into a normalized 1–100 score.",
        "deliverables": "Dynamic recalculation listener, FAIR financial exposure estimator ($ USD), real-time risk meter."
    },
    {
        "id": "FR-04",
        "name": "AI Risk Prediction & Intelligent Remediation",
        "persona": "Security Engineer / CISO",
        "phase": "Phase 7 (Sprint 7)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Spring AI / LLM pipeline predicting probable attack paths from asset CVE telemetry and generating step-by-step remediation playbooks.",
        "deliverables": "Spring AI client integration, prompt templates, NextRisk AI Copilot drawer, playbook task checklist."
    },
    {
        "id": "FR-05",
        "name": "Compliance Management & Controls",
        "persona": "Compliance Officer / GRC",
        "phase": "Phase 5 (Sprint 5)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Multi-framework baseline compliance tracking for ISO/IEC 27001:2022, NIST CSF 2.0, and SOC 2 Type II with audit evidence tracking.",
        "deliverables": "Flyway V7 framework seeds, compliance posture percentage calculator, control assessment wizard, audit evidence uploader."
    },
    {
        "id": "FR-06",
        "name": "Security Policy Management & Versioning",
        "persona": "GRC Analyst / Auditor",
        "phase": "Phase 5 (Sprint 5)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Repository of internal security policies with document versioning, approval workflows (Draft -> Review -> Approved), and markdown preview.",
        "deliverables": "Flyway V8 schema, document metadata store, policy viewer component with revision history comparison."
    },
    {
        "id": "FR-07",
        "name": "Vulnerability Reports & Pentest Ingestion",
        "persona": "Penetration Tester / SOC",
        "phase": "Phase 3 (Sprint 3)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Automated ingestion and manual logging of vulnerability findings with CVSS v3 scoring parser and direct linking to affected business assets.",
        "deliverables": "Flyway V5 schema, JSON/CSV pentest report parser, finding severity classifier (Critical/High/Medium/Low)."
    },
    {
        "id": "FR-08",
        "name": "Asset Inventory & Criticality Classification",
        "persona": "SOC Engineer / IT Admin",
        "phase": "Phase 3 (Sprint 3)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Comprehensive asset catalog (Servers, Cloud, Web Apps, Databases) with classification tiering, data sensitivity, and business criticality weighting.",
        "deliverables": "Flyway V4 schema, Asset CRUD APIs, interactive inventory grid with environment filters and criticality badges."
    },
    {
        "id": "FR-09",
        "name": "Executive & Security Operations Dashboards",
        "persona": "CISO / SOC Analyst",
        "phase": "Phase 8 (Sprint 8)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Dual-view dashboards: Executive CISO high-level view (financial exposure, compliance posture, top risks) and SOC live technical feed (open alerts, incident stream).",
        "deliverables": "KPI aggregation endpoints, Recharts posture visualization, live incident feed, Mean Time to Remediate (MTTR) metrics."
    },
    {
        "id": "FR-10",
        "name": "Security Incident Management & Response",
        "persona": "SOC Analyst / Incident Lead",
        "phase": "Phase 6 (Sprint 6)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "End-to-end incident lifecycle state machine (Reported -> Triaged -> Containment -> Resolved) with SLA timers and containment audit log.",
        "deliverables": "Flyway V9 schema, incident entity & state machine, triage Kanban board, containment checklist."
    },
    {
        "id": "FR-11",
        "name": "Risk Prioritization Matrix & Heatmap",
        "persona": "GRC Analyst / Executive",
        "phase": "Phase 4 (Sprint 4)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Interactive 5x5 dynamic risk heatmap (Likelihood vs. Impact) with drill-down capability and Business Impact Analysis (BIA) weighting.",
        "deliverables": "Heatmap matrix component, drag-and-drop reassessment, risk distribution density analytics."
    },
    {
        "id": "FR-12",
        "name": "Role-Based Access Control (RBAC)",
        "persona": "Security Admin",
        "phase": "Phase 1 (Sprint 1)",
        "status": "DONE — VERIFIED",
        "status_class": "badge-done",
        "desc": "Granular authorization with 5 seeded enterprise roles: ROLE_ADMIN, ROLE_CISO, ROLE_GRC_ANALYST, ROLE_SOC_ANALYST, ROLE_PENTESTER.",
        "deliverables": "Flyway V2 role seeding, Spring @PreAuthorize decorators, frontend protected route guards, role-tailored sidebar."
    },
    {
        "id": "FR-13",
        "name": "Notifications & Real-Time Alerts",
        "persona": "SOC Analyst / GRC Analyst",
        "phase": "Phase 6 (Sprint 6)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "In-app alert notification center with threshold triggers for high-risk breaches, SLA violations, and new critical vulnerability disclosures.",
        "deliverables": "Notification dispatcher service, alert dropdown drawer, badge counter, visual toast alerts."
    },
    {
        "id": "FR-14",
        "name": "Automated Executive & Compliance Reporting",
        "persona": "CISO / Compliance Auditor",
        "phase": "Phase 8 (Sprint 8)",
        "status": "PLANNED",
        "status_class": "badge-planned",
        "desc": "Automated generation and export of board-ready PDF executive summaries, compliance audit matrices, and CSV raw data exports.",
        "deliverables": "PDF report rendering engine, CSV stream export, one-click executive report generation UI."
    }
]

# Complete 96 Task Backlog across 10 Phases
PHASES_DATA = [
    # Phase 0
    {
        "phase_id": "Phase 0",
        "phase_name": "Monorepo & Environment Initialization",
        "sprint": "Sprint 0 (Foundation)",
        "status": "100% COMPLETE & VERIFIED",
        "status_badge": "badge-done",
        "color": "#059669",
        "bg_color": "#ecfdf5",
        "objective": "Establish containerized development environment, multi-tier project scaffolding, MySQL 8 with persistent volumes, and healthcheck orchestration.",
        "platform_output": {
            "summary": "At the conclusion of Sprint 0, the site provides a fully automated, containerized local hosting environment where frontend, backend, and database interact seamlessly via Docker Compose.",
            "ui_features": [
                "Vite 5.4 dev server running at http://localhost:5173 with hot module reloading",
                "App shell baseline with route placeholders and automated Vitest suite (36 tests passing)",
                "Nginx reverse proxy container ready for production artifact bundling"
            ],
            "backend_capabilities": [
                "Spring Boot 3.3.5 REST API running at http://localhost:8080 with Hikari connection pool",
                "MySQL 8.0 container running on ports 3306/3307 with automated mysqladmin healthchecks",
                "Flyway migration pipeline initialized and validating schema on startup"
            ],
            "business_value": "Zero-friction developer onboarding: any engineer can launch the entire platform stack locally with a single command (docker compose up) without manual database or environment setup."
        },
        "tasks": [
            ("INFRA-001", "Repository Architecture Scaffolding", "DevOps", "P0", "S", "DONE", "None", "Created monorepo layout (backend/, frontend/, docker/, docs/)."),
            ("INFRA-002", "MySQL 8 Containerization with Healthcheck", "Database", "P0", "S", "DONE", "INFRA-001", "Configured MySQL 8.0 container with mysqladmin ping healthcheck and persistent volumes."),
            ("INFRA-003", "Spring Boot 3.3.5 Backend Scaffolding", "Backend", "P0", "M", "DONE", "INFRA-001", "Configured Java 21 / Maven project with Web, JPA, Security, Lombok, and Flyway dependencies."),
            ("INFRA-004", "React 18 / Vite 5.4 Frontend Scaffolding", "Frontend", "P0", "M", "DONE", "INFRA-001", "Initialized modern React 18 SPA with Vite, React Router 6, Vitest, and testing library."),
            ("INFRA-005", "Full-Stack Docker Compose Orchestration", "DevOps", "P0", "M", "DONE", "INFRA-002..004", "Docker Compose wiring db:3306, backend:8080, and frontend:5173 with automatic service dependency."),
            ("INFRA-006", "Environment Templates & Validation", "Security", "P0", "S", "DONE", "None", "Established .env.example templates and isolated secrets from version control.")
        ]
    },

    # Phase 1
    {
        "phase_id": "Phase 1",
        "phase_name": "Security Core, Authentication & RBAC MVP",
        "sprint": "Sprint 1 (Security MVP)",
        "status": "87% VERIFIED (20/23 DONE)",
        "status_badge": "badge-done",
        "color": "#10b981",
        "bg_color": "#f0fdf4",
        "objective": "Implement production-grade stateless JWT authentication, rotating opaque refresh tokens with theft-detection family revocation, Spring Security 6 filter chain, 5 RBAC roles, and modern React auth UI.",
        "platform_output": {
            "summary": "At the conclusion of Sprint 1, the platform features a complete, enterprise-grade authentication portal where users can register, log in, maintain secure sessions, and access role-restricted resources.",
            "ui_features": [
                "Live Login (/login) and Self-Registration (/register) portals with real-time validation and error banners",
                "Authenticated User Profile screen (/profile) displaying user identity, email, and assigned roles",
                "Admin RBAC Verification screen (/admin) showing live permission status against backend endpoints",
                "Role-tailored navigation sidebar and top bar automatically hiding/showing modules based on granted roles",
                "Client-side protected route guards (/routes/ProtectedRoute) preventing unauthorized access with /403 redirect"
            ],
            "backend_capabilities": [
                "Stateless JWT access token issuance (15-min lifetime) with Nimbus HMAC validation",
                "Single-use rotating refresh tokens stored in HttpOnly, SameSite=Strict cookies with replay theft detection",
                "Single-flight Axios interceptor queue preventing race conditions during concurrent token refreshes",
                "Role-Based Access Control enforcing 5 seeded roles: ADMIN, CISO, GRC_ANALYST, SOC_ANALYST, PENTESTER",
                "Automated system admin bootstrap runner initializing default root credentials safely"
            ],
            "business_value": "Zero-trust user identity foundation. Protects all future business modules (risks, vulnerabilities, compliance) from unauthorized access, session hijacking, and brute-force token reuse."
        },
        "tasks": [
            ("DB-001", "Flyway V1 & V2: Roles and Schema Seeding", "Database", "P0", "S", "DONE", "INFRA-002", "V1 base schema and V2 seed script for 5 enterprise RBAC roles."),
            ("DB-002", "Flyway V1: Users & User-Roles Tables", "Database", "P0", "S", "DONE", "DB-001", "Established users, roles, and user_roles junction tables with unique constraints."),
            ("DB-003", "Flyway V3: Refresh Tokens & Family Chain", "Database", "P0", "S", "DONE", "DB-002", "Created refresh_tokens table with token_hash, family_id, replaced_by, and revoked_at."),
            ("BE-AUTH-001", "User Self-Registration Endpoint", "Backend", "P0", "M", "DONE", "DB-002", "POST /api/auth/register with BCrypt 10 password hashing and default role assignment."),
            ("BE-AUTH-002", "User Login & Authentication Manager", "Backend", "P0", "M", "DONE", "DB-002", "POST /api/auth/login validating credentials and returning short-lived JWT access token."),
            ("BE-AUTH-003", "Stateless JWT Issuance & Nimbus Validation", "Security", "P0", "M", "DONE", "BE-AUTH-002", "15-minute HS256 JWT access tokens containing user ID, username, and role authorities."),
            ("BE-AUTH-004", "Opaque Refresh Token Rotation & Theft Detection", "Security", "P0", "M", "DONE", "DB-003", "POST /api/auth/refresh rotating single-use refresh tokens; revokes entire family on replay."),
            ("BE-AUTH-005", "Server-Side Logout & Family Revocation", "Backend", "P0", "S", "DONE", "BE-AUTH-004", "POST /api/auth/logout revoking active refresh token family and clearing HttpOnly cookie."),
            ("BE-AUTH-006", "Current User Profile Endpoint (/api/auth/me)", "Backend", "P0", "S", "DONE", "BE-AUTH-003", "GET /api/auth/me returning authenticated user identity, email, and granted authorities."),
            ("BE-AUTH-007", "Spring Security 6 Stateless Filter Chain & CORS", "Security", "P0", "M", "DONE", "BE-AUTH-003", "Stateless session creation, custom JwtAuthenticationFilter, and explicit CORS config."),
            ("BE-AUTH-008", "RBAC Enforcement & Admin Probe (/api/admin/ping)", "Backend", "P0", "S", "DONE", "BE-AUTH-007", "@PreAuthorize('hasRole(\"ADMIN\")') probe returning 200 OK for admin and 403 Forbidden for non-admin."),
            ("BE-AUTH-009", "Safe Bootstrap Admin Provisioning Engine", "Security", "P1", "S", "DONE", "BE-AUTH-002", "Startup runner provisioning default system administrator with deterministic role wiring."),
            ("BE-AUTH-010", "Automated Scheduled Expired Token Purging", "Backend", "P2", "S", "PARTIAL", "BE-AUTH-004", "Purge method implemented in RefreshTokenService; requires @Scheduled cron activation."),
            ("FE-AUTH-001", "Login Page & Form Validation", "Frontend", "P0", "M", "DONE", "INFRA-004", "React login screen with real-time field validation, error banners, and loading state."),
            ("FE-AUTH-002", "Register Page & Form Validation", "Frontend", "P0", "M", "DONE", "INFRA-004", "React registration screen with password confirmation, complexity checks, and redirect."),
            ("FE-AUTH-003", "Axios Client, Interceptors & Single-Flight Refresh", "Frontend", "P0", "M", "DONE", "FE-AUTH-001", "Axios interceptor catching 401, queuing concurrent requests, and executing single refresh."),
            ("FE-AUTH-004", "AuthContext Lifecycle & Auto Session Restore", "Frontend", "P0", "M", "DONE", "FE-AUTH-003", "Context keeping token in memory, restoring session on reload via silent refresh."),
            ("FE-AUTH-005", "Protected Route Guards & Role-Based Access", "Frontend", "P0", "S", "DONE", "FE-AUTH-004", "ProtectedRoute redirecting unauthenticated users to /login and unauthorized to /403."),
            ("FE-AUTH-006", "User Profile Page (/profile)", "Frontend", "P1", "S", "DONE", "FE-AUTH-005", "User profile screen showing account metadata, role badges, and active session status."),
            ("FE-AUTH-007", "Admin Access Verification Page (/admin)", "Frontend", "P1", "S", "DONE", "FE-AUTH-005", "Admin verification dashboard probing /api/admin/ping and displaying RBAC status."),
            ("FE-AUTH-008", "Responsive AppShell & Role-Aware Navigation", "Frontend", "P1", "M", "DONE", "FE-AUTH-005", "Navigation sidebar and top header dynamically showing navigation links per role."),
            ("FE-AUTH-009", "Self-Service Password Reset Workflow", "Full-Stack", "P2", "L", "PLANNED", "BE-AUTH-002", "Email token verification and self-service password recovery flow."),
            ("FE-AUTH-010", "Auth Portal Visual Polish / Redesign Realignment", "Frontend", "P2", "M", "REVIEW", "FE-AUTH-001", "Visual alignment with high-fidelity corporate reference mockups.")
        ]
    },

    # Phase 2 (NEW & EXPANDED: Public Marketing Web Portal)
    {
        "phase_id": "Phase 2",
        "phase_name": "Public Website, Marketing Portal & Landing Pages",
        "sprint": "Sprint 2 (Public Web Presence)",
        "status": "READY TO COMMENCE — HIGH PRIORITY",
        "status_badge": "badge-planned",
        "color": "#06b6d4",
        "bg_color": "#ecfeff",
        "objective": "Build the complete public-facing web experience that visitors see when visiting the domain: Home Page, Services, About Us, Pricing, Contact Us, and Demo Request.",
        "platform_output": {
            "summary": "At the conclusion of Sprint 2, the website features a stunning, world-class public cyber marketing portal. Any visitor can explore platform solutions, test the interactive live risk simulator, view pricing tiers, read company background, and submit demo requests.",
            "ui_features": [
                "Public Sticky Navbar with brand crest, navigation links (Home, Services, Pricing, About, Contact), Theme Toggle, and 'Sign In / Register' CTAs",
                "Home Page (/) featuring Hero banner with dynamic cyber particle effects, feature showcases, and an Interactive Live Risk Simulator slider widget",
                "Services & Solutions Page (/services) breaking down GRC Automation, SOC Monitoring, Pentest Linking, and AI Remediation",
                "About Us Page (/about) detailing the mission, engineering philosophy, and leadership profile of Mohamed Shosha",
                "Pricing Plans Page (/pricing) featuring Community, Starter, and Enterprise tiers with a feature comparison checklist",
                "Contact Us & Demo Request Page (/contact) with interactive inquiry form, office location info, and interactive FAQ accordion",
                "Global Responsive Footer with sitemap links, social channels, newsletter subscription, and legal terms"
            ],
            "backend_capabilities": [
                "Contact Inquiry & Demo Request API (/api/public/contact) validating and logging prospect leads",
                "Newsletter Subscription API (/api/public/newsletter) storing email opt-ins",
                "Public System Status Probe (/api/public/status) providing live platform operational health metrics"
            ],
            "business_value": "Transforms the technical backend repository into an attractive, customer-facing SaaS product that inspires confidence, clearly explains the platform value, and converts visitors into registered users."
        },
        "tasks": [
            ("FE-NAV-001", "Public Sticky Header & Responsive Navbar", "Frontend", "P0", "M", "PLANNED", "INFRA-004", "Navbar with Logo, navigation links, ThemeToggle, and 'Sign In' / 'Get Started' action buttons."),
            ("FE-FOOT-001", "Global Public Footer & Sitemap Component", "Frontend", "P0", "S", "PLANNED", "INFRA-004", "Footer with product links, company overview, newsletter signup, and copyright notice."),
            ("FE-HOME-001", "Home Page: Hero Section & Action CTAs", "Frontend", "P0", "M", "PLANNED", "FE-NAV-001", "Impactful Hero with cybersecurity badge, bold value statement, 'Start Free Trial' and 'Book Demo' CTAs."),
            ("FE-HOME-002", "Home Page: Core Security Solutions Grid", "Frontend", "P0", "M", "PLANNED", "FE-HOME-001", "4 Interactive cards showcasing GRC, SOC, Pentest Ingestion, and Predictive AI with hover micro-animations."),
            ("FE-HOME-003", "Home Page: Interactive Live Risk Calculator Widget", "Frontend", "P1", "M", "PLANNED", "FE-HOME-002", "Client-side interactive widget letting visitors adjust sliders and preview live risk score calculation in real time."),
            ("FE-HOME-004", "Home Page: Metrics Counter & Testimonials", "Frontend", "P1", "S", "PLANNED", "FE-HOME-002", "Animated statistics bar (e.g. 70% Faster Audits, 99.9% Uptime) and executive quote carousel."),
            ("FE-SERV-001", "Dedicated Services & Solutions Page (/services)", "Frontend", "P0", "M", "PLANNED", "FE-NAV-001", "Comprehensive solutions page with deep dives into GRC automation, live SOC telemetry, and AI playbooks."),
            ("FE-ABOUT-001", "About Us & Leadership Page (/about)", "Frontend", "P1", "M", "PLANNED", "FE-NAV-001", "Mission, vision, technology stack badges, and Leadership Architect profile for Mohamed Shosha."),
            ("FE-PRICE-001", "Pricing & Subscription Plans Page (/pricing)", "Frontend", "P1", "M", "PLANNED", "FE-NAV-001", "3-tier pricing cards (Community, Professional, Enterprise) with monthly/annual toggle and feature matrix."),
            ("FE-CONT-001", "Contact Us & Inquiry Form Page (/contact)", "Frontend", "P0", "M", "PLANNED", "FE-NAV-001", "Interactive contact form with real-time validation, business email checks, and direct support info."),
            ("FE-DEMO-001", "Book a Live Product Demo Modal & Scheduler", "Frontend", "P1", "M", "PLANNED", "FE-CONT-001", "Interactive modal allowing prospects to select date/time and request an architectural walkthrough."),
            ("FE-FAQ-001", "Interactive FAQ Accordion Component", "Frontend", "P2", "S", "PLANNED", "FE-CONT-001", "Smooth expandable accordion answering top questions regarding data privacy, compliance, and AI safety.")
        ]
    },

    # Phase 3
    {
        "phase_id": "Phase 3",
        "phase_name": "Asset Inventory & Vulnerability Ingestion",
        "sprint": "Sprint 3 (Asset & Vuln Core)",
        "status": "PLANNED",
        "status_badge": "badge-planned",
        "color": "#0284c7",
        "bg_color": "#f0f9ff",
        "objective": "Establish centralized asset repository with classification/criticality tiers, and implement vulnerability finding ingestion with CVSS v3 score parsing.",
        "platform_output": {
            "summary": "At the conclusion of Sprint 3, the site delivers a searchable cyber asset inventory and a vulnerability ingestion portal that turns raw pentest files into actionable technical findings.",
            "ui_features": [
                "Interactive Asset Inventory Catalog (/assets) with real-time search, environment filters (Prod/Staging/Dev), and criticality badges",
                "Asset Creation / Edit Modal Drawer allowing engineers to register new servers, web apps, databases, and cloud services",
                "Vulnerability Explorer Dashboard (/vulnerabilities) with metric cards showing Critical, High, Medium, and Low findings",
                "Pentest Ingestion Wizard allowing drag-and-drop file uploads (JSON/CSV) with live parsing preview and bulk import confirmation"
            ],
            "backend_capabilities": [
                "RESTful Asset Management APIs (/api/assets) supporting CRUD operations with RBAC permission enforcement",
                "Asset Criticality Weighting Service calculating organizational impact factors based on data classification tier",
                "Vulnerability Finding CRUD APIs (/api/vulnerabilities) linking findings directly to affected asset entity IDs",
                "Automated CVSS v3 Parser ingesting raw scanner reports (Nessus, Burp Suite, OpenVAS) and normalizing vulnerability metrics"
            ],
            "business_value": "Eliminates shadow IT and fragmented vulnerability spreadsheets by creating an authoritative single-source inventory of all enterprise IT assets and their active vulnerabilities."
        },
        "tasks": [
            ("DB-ASSET-001", "Flyway V4: Asset Entity & Classification Schema", "Database", "P0", "M", "PLANNED", "DB-003", "Create assets table with name, type, classification (Public/Confidential/Restricted), and criticality (Low..Critical)."),
            ("DB-VULN-001", "Flyway V5: Vulnerabilities & Findings Schema", "Database", "P0", "M", "PLANNED", "DB-ASSET-001", "Create vulnerabilities table with CVE ID, CVSS v3 base score, severity, remediation status, and asset FK."),
            ("BE-ASSET-001", "Asset Domain Entity, Repository & CRUD APIs", "Backend", "P0", "M", "PLANNED", "DB-ASSET-001", "Spring Boot REST controllers for listing, creating, updating, and archiving organization assets."),
            ("BE-ASSET-002", "Asset Criticality & Environment Tiering Engine", "Backend", "P1", "S", "PLANNED", "BE-ASSET-001", "Service logic computing asset business value weighting factor based on data classification and environment."),
            ("BE-VULN-001", "Vulnerability Entity, Repository & CRUD APIs", "Backend", "P0", "M", "PLANNED", "DB-VULN-001", "REST endpoints for managing vulnerability findings, status tracking (Open/Fixed/Accepted), and asset associations."),
            ("BE-VULN-002", "Pentest Report Ingestion & CVSS v3 Parser", "Backend", "P1", "L", "PLANNED", "BE-VULN-001", "Service parsing JSON/CSV pentest reports (Nessus/Burp format) and auto-generating vulnerability records."),
            ("FE-ASSET-001", "Asset Inventory Table with Multi-Filter Support", "Frontend", "P0", "M", "PLANNED", "BE-ASSET-001", "Interactive React data table supporting filtering by asset type, environment, criticality, and search query."),
            ("FE-ASSET-002", "Asset Creation / Edit Modal & Detail View", "Frontend", "P1", "M", "PLANNED", "FE-ASSET-001", "Modal drawer with form validation for onboarding assets and viewing linked vulnerability findings."),
            ("FE-VULN-001", "Vulnerability & Finding Explorer Dashboard", "Frontend", "P0", "M", "PLANNED", "BE-VULN-001", "Vulnerability explorer view with severity metric cards (Critical/High/Medium/Low) and filterable finding table."),
            ("FE-VULN-002", "Pentest Report Upload & Ingestion Wizard", "Frontend", "P1", "M", "PLANNED", "BE-VULN-002", "Drag-and-drop file uploader with schema validation, finding preview, and one-click bulk import.")
        ]
    },

    # Phase 4
    {
        "phase_id": "Phase 4",
        "phase_name": "Centralized Risk Register & Dynamic Scoring Engine",
        "sprint": "Sprint 4 (Risk Engine)",
        "status": "PLANNED",
        "status_badge": "badge-planned",
        "color": "#d97706",
        "bg_color": "#fffbeb",
        "objective": "Build centralized cyber risk register, implement algorithmic live risk scoring model combining assets and vulnerabilities, and construct interactive 5x5 heatmap.",
        "platform_output": {
            "summary": "At the conclusion of Sprint 4, the site delivers a full GRC Risk Register with real-time algorithmic risk scoring, an interactive 5x5 heatmap, and quantified financial loss estimation ($ USD).",
            "ui_features": [
                "Centralized Risk Register Grid (/risks) displaying risk ID, category, owner, inherent/residual scores, and live risk score meters",
                "Interactive 5x5 Risk Heatmap Component (Likelihood vs. Impact) with dynamic cell counters and click-to-filter drill-down",
                "Multi-Step Risk Assessment Wizard with real-time score preview slider responding immediately as parameters change",
                "Financial Risk Exposure Card displaying FAIR dollar quantification ($ USD) per risk and for the entire organization"
            ],
            "backend_capabilities": [
                "Algorithmic Dynamic Scoring Engine computing Live Risk Score (1–100) automatically on every asset/vulnerability update",
                "FAIR Framework Calculator quantifying Annualized Loss Expectancy (ALE = SLE * ARO) based on business criticality",
                "Risk Matrix Aggregation API grouping active risks into likelihood/impact coordinates with boundary color coding",
                "Event listener listening for vulnerability changes and recalculating affected organizational risk scores automatically"
            ],
            "business_value": "Transforms abstract technical vulnerability metrics into quantified financial exposure that executive management and board members can immediately understand and prioritize."
        },
        "tasks": [
            ("DB-RISK-001", "Flyway V6: Risk Register & Scoring Schema", "Database", "P0", "M", "PLANNED", "DB-VULN-001", "Create risks table with title, category, asset FK, inherent/residual scores, live_risk_score, and FAIR exposure ($)."),
            ("BE-RISK-001", "Risk Entity, Repository & CRUD APIs", "Backend", "P0", "M", "PLANNED", "DB-RISK-001", "REST controllers for full risk lifecycle management (Identify, Assess, Treat, Accept, Review)."),
            ("BE-RISK-002", "Dynamic Algorithmic Risk Calculation Engine", "Backend", "P0", "L", "PLANNED", "BE-RISK-001, BE-VULN-001", "Algorithmic engine: Score = [(Criticality * 0.35) + (CVSS * 0.35) + (Likelihood * 0.20)] * (1 - ControlEff * 0.70)."),
            ("BE-RISK-003", "Financial Exposure Quantification (FAIR Model)", "Backend", "P1", "M", "PLANNED", "BE-RISK-002", "FAIR framework computation: Annualized Loss Expectancy (ALE) = Single Loss Expectancy (SLE) * ARO ($ USD)."),
            ("BE-RISK-004", "Risk Prioritization Matrix Engine (5x5 Heatmap)", "Backend", "P1", "M", "PLANNED", "BE-RISK-002", "Matrix aggregation service grouping active risks into 5x5 likelihood/impact coordinates with boundary thresholds."),
            ("FE-RISK-001", "Centralized Risk Register Data Grid & Filtering", "Frontend", "P0", "M", "PLANNED", "BE-RISK-001", "Interactive risk register table with live risk score meter, category filters, owner tags, and status updates."),
            ("FE-RISK-002", "Interactive 5x5 Risk Heatmap Component", "Frontend", "P1", "M", "PLANNED", "BE-RISK-004", "Visual 5x5 colored grid component with risk count badges, click-to-filter interaction, and cell drill-down."),
            ("FE-RISK-003", "Risk Creation Wizard with Real-Time Score Preview", "Frontend", "P1", "M", "PLANNED", "BE-RISK-002", "Multi-step risk assessment modal calculating real-time risk score preview as the user adjusts parameters.")
        ]
    },

    # Phase 5
    {
        "phase_id": "Phase 5",
        "phase_name": "Compliance Management & Policy Governance",
        "sprint": "Sprint 5 (GRC & Compliance)",
        "status": "PLANNED",
        "status_badge": "badge-planned",
        "color": "#7c3aed",
        "bg_color": "#faf5ff",
        "objective": "Implement multi-framework baseline compliance tracking (ISO 27001, NIST CSF, SOC 2), control assessment checklists, and security policy versioning.",
        "platform_output": {
            "summary": "At the conclusion of Sprint 5, the platform provides continuous compliance tracking across major frameworks and a policy governance repository with version history.",
            "ui_features": [
                "Compliance Posture Dashboard (/compliance) featuring radial progress gauges for ISO/IEC 27001, NIST CSF 2.0, and SOC 2 Type II",
                "Control Assessment Checklist allowing auditors to evaluate controls (Compliant, In-Progress, Non-Compliant) with evidence badges",
                "Audit Evidence Upload Modal allowing compliance teams to attach PDF/screenshot verification proofs to specific controls",
                "Security Policy Repository & Document Reader (/policies) displaying company policies in markdown with version change history"
            ],
            "backend_capabilities": [
                "Preloaded framework baseline seeds for ISO 27001:2022 clauses, NIST CSF categories, and SOC 2 Trust Criteria",
                "Automated Compliance Percentage Engine aggregating control statuses into real-time readiness scores",
                "Audit Evidence Storage Service handling secure file uploads, hashing, and link associations with controls",
                "Policy Lifecycle State Machine managing document status workflows (Draft -> Under Review -> Approved -> Retired)"
            ],
            "business_value": "Replaces manual audit spreadsheets with continuous, real-time audit readiness, cutting external audit prep time by up to 70%."
        },
        "tasks": [
            ("DB-COMP-001", "Flyway V7: Frameworks, Controls & Assessment Schema", "Database", "P0", "M", "PLANNED", "DB-RISK-001", "Create compliance_frameworks, controls, and control_assessments tables with audit evidence attachments."),
            ("DB-POL-001", "Flyway V8: Policy Governance & Document Versioning", "Database", "P1", "M", "PLANNED", "DB-COMP-001", "Create security_policies and policy_revisions tables tracking version, review cycle, and approval state."),
            ("BE-COMP-001", "Framework Baseline Seeds (ISO 27001, NIST, SOC 2)", "Backend", "P0", "M", "PLANNED", "DB-COMP-001", "Seed datasets containing ISO/IEC 27001:2022 clauses, NIST CSF 2.0 categories, and SOC 2 Trust Services Criteria."),
            ("BE-COMP-002", "Compliance Score Calculation Engine (% Progress)", "Backend", "P0", "M", "PLANNED", "BE-COMP-001", "Service aggregating control implementation status into percentage compliance score per framework."),
            ("BE-COMP-003", "Control Assessment & Audit Evidence Upload API", "Backend", "P1", "M", "PLANNED", "BE-COMP-001", "REST endpoints for assessing controls (Compliant/In-Progress/Non-Compliant) and uploading audit evidence files."),
            ("BE-POL-001", "Security Policy Repository & Lifecycle Workflow", "Backend", "P1", "M", "PLANNED", "DB-POL-001", "REST APIs managing policy lifecycle state machine: DRAFT -> UNDER_REVIEW -> APPROVED -> RETIRED."),
            ("BE-POL-002", "Policy Document Versioning & Secure Storage", "Backend", "P2", "M", "PLANNED", "BE-POL-001", "Storage service managing version increments, change logs, and secure document attachments."),
            ("FE-COMP-001", "Compliance Posture Radial Gauges & Overview", "Frontend", "P0", "M", "PLANNED", "BE-COMP-002", "Compliance dashboard with radial progress meters for ISO 27001, NIST CSF, and SOC 2 posture."),
            ("FE-COMP-002", "Control Assessment Checklist & Evidence Modal", "Frontend", "P1", "M", "PLANNED", "BE-COMP-003", "Interactive checklist interface allowing auditors to update control statuses and view evidence."),
            ("FE-POL-001", "Security Policy Document Reader & Version History", "Frontend", "P1", "M", "PLANNED", "BE-POL-001", "Markdown document reader displaying active corporate security policies with revision history timeline.")
        ]
    },

    # Phase 6
    {
        "phase_id": "Phase 6",
        "phase_name": "Security Incident Management & Workflow Automation",
        "sprint": "Sprint 6 (SOC Operations)",
        "status": "PLANNED",
        "status_badge": "badge-planned",
        "color": "#e11d48",
        "bg_color": "#fff1f2",
        "objective": "Build security incident triage board, state machine tracking containment SLAs, and automated alerting for critical risk threshold breaches.",
        "platform_output": {
            "summary": "At the conclusion of Sprint 6, the site offers an operational SOC Incident Triage Center with SLA countdown clocks, containment audit logging, and in-app alert notifications.",
            "ui_features": [
                "Incident Triage Kanban Board (/incidents) organizing active cases across Reported, Triaged, Containment, and Resolved columns",
                "SLA Countdown Clocks with visual warning colors (Yellow/Red) alerting responders when breach windows approach",
                "Incident Detail View showing linked affected assets, risk severity, lead investigator assignment, and containment checklist",
                "Real-Time Notification Drawer in the header showing unread badge count, high-risk breach alerts, and dismiss controls"
            ],
            "backend_capabilities": [
                "Incident Lifecycle State Machine strictly enforcing legal investigation transitions and audit events",
                "Incident-to-Asset and Risk Correlation Engine mapping active attacks directly to registered infrastructure",
                "Critical Risk Alert Dispatcher firing asynchronous notifications whenever live risk scores breach critical thresholds",
                "Immutable Chronological Audit Timeline tracking every action taken during incident triage and containment"
            ],
            "business_value": "Drastically reduces Mean Time to Detect (MTTD) and Mean Time to Respond (MTTR), ensuring organizational accountability and compliance with regulatory breach reporting windows."
        },
        "tasks": [
            ("DB-INC-001", "Flyway V9: Incidents, Timeline & Alerting Schema", "Database", "P0", "M", "PLANNED", "DB-RISK-001", "Create incidents, incident_timeline, and notification_events tables with severity and SLA deadlines."),
            ("BE-INC-001", "Incident Entity, Repository & State Machine", "Backend", "P0", "M", "PLANNED", "DB-INC-001", "REST controller and state machine enforcing transitions: REPORTED -> TRIAGED -> CONTAINMENT -> RESOLVED."),
            ("BE-INC-002", "Incident-to-Asset/Risk Correlation API", "Backend", "P1", "M", "PLANNED", "BE-INC-001, BE-RISK-001", "Correlation service linking incoming security incidents directly to registered assets and open risks."),
            ("BE-NOTIF-001", "Critical Risk Threshold Alert Dispatcher", "Backend", "P1", "M", "PLANNED", "BE-INC-001, BE-RISK-002", "Event listener firing real-time notifications when a risk exceeds critical score threshold or incident SLA breaches."),
            ("FE-INC-001", "Incident Triage Board (Kanban / List with SLAs)", "Frontend", "P0", "M", "PLANNED", "BE-INC-001", "Kanban drag-and-drop / filterable list view showing active incidents, severity badges, and countdown timers."),
            ("FE-INC-002", "Incident Timeline & Containment Audit Log Screen", "Frontend", "P1", "M", "PLANNED", "BE-INC-002", "Detailed incident view showing root cause analysis, containment checklist, and chronological audit log."),
            ("FE-NOTIF-001", "Real-Time Notification Center & Alert Banner", "Frontend", "P1", "M", "PLANNED", "BE-NOTIF-001", "Header notification bell with unread badge counter, alert dropdown, and toast notification popups.")
        ]
    },

    # Phase 7
    {
        "phase_id": "Phase 7",
        "phase_name": "AI-Powered Risk Prediction & Intelligent Remediation",
        "sprint": "Sprint 7 (AI Engine)",
        "status": "PLANNED",
        "status_badge": "badge-planned",
        "color": "#2563eb",
        "bg_color": "#eff6ff",
        "objective": "Integrate Spring AI with LLM models for automated threat vector prediction, customized remediation playbook generation, and executive report synthesis.",
        "platform_output": {
            "summary": "At the conclusion of Sprint 7, the site features an intelligent AI Copilot that forecasts likely attack vectors and generates actionable, step-by-step remediation playbooks for active risks.",
            "ui_features": [
                "NextRisk AI Copilot Panel embedded as a slide-over drawer in both the Risk Register and Vulnerability Explorer views",
                "One-Click 'Generate Remediation Playbook' button producing customized mitigation procedures tailored to the asset stack",
                "Remediation Action Plan Modal featuring copyable CLI commands, configuration patches, and task completion checkboxes",
                "Predictive Threat Alerts Banner warning security teams of high-probability attack chains across connected assets"
            ],
            "backend_capabilities": [
                "Spring AI Integration Layer connecting to OpenAI / Gemini / Local LLMs with token budgeting and resilience retries",
                "Threat Vector Prediction Engine analyzing asset topologies and open CVE combinations to forecast breach paths",
                "Remediation Playbook Generation Service utilizing structured prompt templates to produce deterministic engineering fixes",
                "AI Inference Caching Layer avoiding redundant model invocations and storing generated recommendations in MySQL"
            ],
            "business_value": "Multiplies security team efficiency by transforming raw vulnerability alerts into verified, copy-paste engineering remediation scripts in seconds instead of hours of manual research."
        },
        "tasks": [
            ("DB-AI-001", "Flyway V10: AI Inferences & Playbook Caching", "Database", "P1", "M", "PLANNED", "DB-INC-001", "Create ai_inferences and remediation_playbooks tables with prompt hashes and cached responses."),
            ("BE-AI-001", "Spring AI / LLM Client Provider Integration", "Backend", "P1", "L", "PLANNED", "DB-AI-001", "Integrate Spring AI framework supporting OpenAI / Gemini / Ollama with token budgeting and retry resilience."),
            ("BE-AI-002", "Threat Vector Prediction Engine", "Backend", "P1", "L", "PLANNED", "BE-AI-001, BE-RISK-002", "LLM reasoning service analyzing system asset combinations and open CVEs to predict likely attack paths."),
            ("BE-AI-003", "Step-by-Step Remediation Playbook Generator", "Backend", "P1", "L", "PLANNED", "BE-AI-001, BE-VULN-001", "Prompt engineering engine generating actionable engineering remediation steps for specific risks and CVEs."),
            ("BE-AI-004", "Executive Summary Narrative Generator", "Backend", "P2", "M", "PLANNED", "BE-AI-001", "Automated generator synthesizing high-level narrative risk insights for CISO and board presentations."),
            ("FE-AI-001", "NextRisk AI Copilot Panel in Risk/Vuln Views", "Frontend", "P1", "M", "PLANNED", "BE-AI-003", "Slide-over AI Assistant drawer allowing analysts to ask questions and generate remediation suggestions."),
            ("FE-AI-002", "Remediation Action Plan Modal & Task Tracker", "Frontend", "P1", "M", "PLANNED", "FE-AI-001", "Interactive modal displaying generated playbook steps with copyable CLI commands and completion checkboxes.")
        ]
    },

    # Phase 8
    {
        "phase_id": "Phase 8",
        "phase_name": "Executive & Security Dashboards + Reporting",
        "sprint": "Sprint 8 (Executive Insights)",
        "status": "PLANNED",
        "status_badge": "badge-planned",
        "color": "#059669",
        "bg_color": "#f0fdf4",
        "objective": "Build CISO executive overview, real-time SOC operations feed, and automated board-ready PDF/CSV compliance report export.",
        "platform_output": {
            "summary": "At the conclusion of Sprint 8, the platform delivers dual-view executive and operational dashboards, and one-click board-ready PDF report downloads.",
            "ui_features": [
                "Executive CISO Dashboard (/dashboard/executive) featuring overall posture score, financial risk gauge ($ USD), top 5 risks, and trends",
                "SOC Real-Time Operational View (/dashboard/soc) with live telemetry stream, incident ticker, and asset health status indicators",
                "Instant Report Export Modal allowing users to generate and download comprehensive board reports and raw audit spreadsheets",
                "Interactive posture graphs and historical trend charts showing risk reduction trajectory over time"
            ],
            "backend_capabilities": [
                "Executive KPI Aggregation Endpoint providing sub-second summary metrics for board presentations",
                "SOC Telemetry Stream API delivering real-time incident counters, Mean Time to Remediate (MTTR), and active alerts",
                "High-Resolution PDF / CSV Report Generation Service compiling charts, registers, and compliance statuses into downloadable files",
                "Role-based dashboard routing automatically landing CISOs on the executive view and SOC analysts on the operational view"
            ],
            "business_value": "Equips the CISO and executive leadership with crisp, financially quantified metrics for board meetings and regulatory filings, proving ROI on security investments."
        },
        "tasks": [
            ("BE-DASH-001", "Executive KPI Aggregation API (Org Risk, Exposure)", "Backend", "P0", "M", "PLANNED", "BE-RISK-003, BE-COMP-002", "REST endpoint providing aggregated metrics: Overall Score (0-100), Total Financial Exposure ($), MTTR."),
            ("BE-DASH-002", "SOC Operational Telemetry & Alert Stream API", "Backend", "P1", "M", "PLANNED", "BE-INC-001", "Live operational stream endpoint returning active alerts, affected assets, and critical open findings."),
            ("BE-REP-001", "Automated PDF / CSV Board Report Generator", "Backend", "P1", "L", "PLANNED", "BE-DASH-001", "Backend service compiling executive summaries, risk registers, and compliance postures into downloadable PDF/CSV."),
            ("FE-DASH-001", "Executive CISO Dashboard (Exposure, Posture, Trends)", "Frontend", "P0", "L", "PLANNED", "BE-DASH-001", "CISO dashboard featuring financial exposure gauge, top 5 critical risks, compliance dials, and trend graphs."),
            ("FE-DASH-002", "SOC Real-Time Operations Monitoring Feed", "Frontend", "P1", "M", "PLANNED", "BE-DASH-002", "Real-time SOC monitoring interface with live threat alerts, asset status indicators, and incident ticker."),
            ("FE-REP-001", "Instant Export & Board-Ready PDF Download UI", "Frontend", "P1", "M", "PLANNED", "BE-REP-001", "One-click export modal allowing executives to download high-resolution board reports and raw audit spreadsheets.")
        ]
    },

    # Phase 9
    {
        "phase_id": "Phase 9",
        "phase_name": "System Hardening, Audit Logs & Production Readiness",
        "sprint": "Sprint 9 (Production Readiness)",
        "status": "PLANNED",
        "status_badge": "badge-planned",
        "color": "#475569",
        "bg_color": "#f8fafc",
        "objective": "Implement immutable activity audit logging, query optimization, rate limiting, asymmetric token signing, and automated CI/CD pipeline.",
        "platform_output": {
            "summary": "At the conclusion of Sprint 9, the platform is fully production-hardened, featuring immutable audit logging, brute-force rate limiting, RS256 token verification, and automated CI/CD pipelines.",
            "ui_features": [
                "Audit Trail Explorer (/audit) displaying chronological system events, actor identity, IP address, and JSON before/after state diffs",
                "Rate Limiting Warning Banners gracefully notifying users when brute-force threshold attempts are exceeded",
                "Production-optimized, sub-second page transitions across both dark and light modes with zero layout shift",
                "Cross-browser and responsive mobile/tablet layout certification"
            ],
            "backend_capabilities": [
                "AspectJ Audit Interceptor automatically recording all create, update, and delete actions across all core domain entities",
                "Bucket4j In-Memory Token Bucket Rate Limiter protecting /api/auth/login and /register against brute-force attacks",
                "Asymmetric RS256 / ES256 Token Signing Architecture with public JWKS discovery endpoint (/oauth2/jwks)",
                "MySQL composite index optimization delivering sub-second response times across large-scale risk registers",
                "Automated GitHub Actions CI/CD Pipeline executing Maven test suites, Vitest frontend tests, and Playwright E2E browser tests"
            ],
            "business_value": "Provides audit-proof compliance with strict legal and enterprise regulations, and guarantees system resilience, scalability, and automated zero-downtime releases."
        },
        "tasks": [
            ("DB-AUDIT-001", "Flyway V11: Immutable Audit Trail Schema", "Database", "P0", "M", "PLANNED", "DB-003", "Create audit_logs table storing actor ID, action, entity type, entity ID, client IP, and before/after JSON diffs."),
            ("BE-AUDIT-001", "AspectJ Audit Logging Interceptor for Sensitive Ops", "Backend", "P0", "M", "PLANNED", "DB-AUDIT-001", "AOP interceptor automatically recording all CUD actions across Risk, Asset, and Policy entities."),
            ("BE-PERF-001", "Read Query Optimization, Index Tuning & Caching", "Backend", "P1", "M", "PLANNED", "All DB tasks", "Composite indexing on risk score queries, Spring Cache abstraction for static framework seeds."),
            ("SEC-HARD-001", "IP/User Rate Limiting (Bucket4j / Nginx Limits)", "Security", "P0", "M", "PLANNED", "BE-AUTH-002", "Rate limiting on /api/auth/login and /register (10 requests/minute per IP) to prevent brute-force attacks."),
            ("SEC-HARD-002", "Asymmetric RS256/ES256 Token Signing & JWKS", "Security", "P2", "M", "PLANNED", "BE-AUTH-003", "Upgrade token signing to RS256 with public JWKS endpoint (/oauth2/jwks) for decoupled verification."),
            ("QA-E2E-001", "End-to-End Automated Browser Tests (Playwright)", "QA", "P1", "L", "PLANNED", "All FE/BE tasks", "Automated browser test suite validating login, risk creation, heatmap click, and PDF export workflows."),
            ("DEVOPS-CI-001", "GitHub Actions Automated Build, Test & Lint CI/CD", "DevOps", "P1", "M", "PLANNED", "INFRA-005", "Automated GitHub Actions workflow running Maven verify, Vitest suites, Docker build, and lint checks.")
        ]
    }
]

def generate_html():
    # Build HTML for FR matrix
    fr_rows = ""
    for fr in FUNCTIONAL_REQUIREMENTS:
        fr_rows += f"""
        <tr>
            <td class="code-id">{fr['id']}</td>
            <td><strong>{fr['name']}</strong></td>
            <td><span class="persona-tag">{fr['persona']}</span></td>
            <td>{fr['phase']}</td>
            <td><span class="badge {fr['status_class']}">{fr['status']}</span></td>
            <td class="desc-text">{fr['desc']}</td>
        </tr>
        """

    # Build HTML for phases and tasks
    phases_html = ""
    for idx, p in enumerate(PHASES_DATA):
        task_rows = ""
        for t in p['tasks']:
            task_id, title, subsystem, priority, effort, status, deps, acceptance = t
            
            # Status styling
            if "DONE" in status:
                st_class = "badge-done"
            elif "PARTIAL" in status:
                st_class = "badge-partial"
            elif "REVIEW" in status:
                st_class = "badge-review"
            else:
                st_class = "badge-planned"
                
            # Priority styling
            p_class = f"prio-{priority.lower()}"
            
            # Subsystem styling
            sub_class = f"sub-{subsystem.lower().replace('-', '').replace(' ', '')}"
            
            task_rows += f"""
            <tr>
                <td class="code-id">{task_id}</td>
                <td>
                    <div class="task-title">{title}</div>
                    <div class="task-criteria"><span class="crit-label">Acceptance:</span> {acceptance}</div>
                </td>
                <td><span class="subsystem-tag {sub_class}">{subsystem}</span></td>
                <td><span class="prio-tag {p_class}">{priority}</span></td>
                <td><span class="effort-tag">{effort}</span></td>
                <td><span class="badge {st_class}">{status}</span></td>
                <td class="dep-text">{deps}</td>
            </tr>
            """
            
        page_break_class = "page-break-before" if idx in [1, 2, 3, 4, 5, 6, 7, 8, 9] else ""
        
        # Platform deliverables box for each sprint
        po = p["platform_output"]
        ui_items = "".join([f"<li>{item}</li>" for item in po["ui_features"]])
        be_items = "".join([f"<li>{item}</li>" for item in po["backend_capabilities"]])
        
        phases_html += f"""
        <div class="phase-block {page_break_class}">
            <div class="phase-header" style="border-left-color: {p['color']};">
                <div class="phase-meta">
                    <span class="sprint-tag">{p['sprint']}</span>
                    <span class="badge {p['status_badge']}">{p['status']}</span>
                </div>
                <h2>{p['phase_id']}: {p['phase_name']}</h2>
                <p class="phase-objective"><strong>Milestone Goal:</strong> {p['objective']}</p>
            </div>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 12%;">Task ID</th>
                        <th style="width: 36%;">Task Title & Acceptance Criteria</th>
                        <th style="width: 12%;">Subsystem</th>
                        <th style="width: 7%;">Prio</th>
                        <th style="width: 6%;">Effort</th>
                        <th style="width: 15%;">Status</th>
                        <th style="width: 12%;">Dependencies</th>
                    </tr>
                </thead>
                <tbody>
                    {task_rows}
                </tbody>
            </table>

            <!-- What the Platform Delivers & Outputs After this Sprint -->
            <div class="sprint-output-box no-break">
                <div class="sprint-output-header">
                    <span class="output-icon">🎯</span>
                    <h4>What The Platform Delivers &amp; Outputs After {p['sprint']}</h4>
                </div>
                <p class="output-summary">{po['summary']}</p>
                <div class="output-grid">
                    <div class="output-col">
                        <div class="output-col-title">🖥️ User Interface &amp; Pages</div>
                        <ul>
                            {ui_items}
                        </ul>
                    </div>
                    <div class="output-col">
                        <div class="output-col-title">⚙️ Backend Engines &amp; APIs</div>
                        <ul>
                            {be_items}
                        </ul>
                    </div>
                    <div class="output-col">
                        <div class="output-col-title">💼 Milestone Business Impact</div>
                        <p class="output-impact-text">{po['business_value']}</p>
                    </div>
                </div>
            </div>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>NextRisk AI (TRUVIA) — Master Sprint Implementation Plan & Roadmap</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        @page {{
            size: A4 portrait;
            margin: 14mm 14mm 14mm 14mm;
            @bottom-right {{
                content: "Page " counter(page);
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 8pt;
                color: #64748b;
            }}
            @bottom-left {{
                content: "NextRisk AI — Prepared by Mohamed Shosha";
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-size: 8pt;
                color: #64748b;
            }}
        }}

        @page :first {{
            margin: 0;
            @bottom-right {{ content: none; }}
            @bottom-left {{ content: none; }}
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }}

        body {{
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #0f172a;
            background-color: #ffffff;
            font-size: 9.5pt;
            line-height: 1.5;
        }}

        .page-break {{
            page-break-after: always;
            break-after: page;
        }}

        .page-break-before {{
            page-break-before: always;
            break-before: page;
        }}

        .no-break {{
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        /* ================= COVER PAGE ================= */
        .cover-page {{
            height: 297mm;
            max-height: 297mm;
            width: 210mm;
            box-sizing: border-box;
            background: linear-gradient(135deg, #090d16 0%, #0f172a 60%, #022c22 100%);
            color: #ffffff;
            padding: 30mm 22mm 24mm 22mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            page-break-after: always;
            break-after: page;
        }}

        .cover-page::before {{
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 20% 80%, rgba(2, 132, 199, 0.12) 0%, transparent 50%);
            pointer-events: none;
        }}

        .cover-brand {{
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 20px;
        }}

        .brand-shield {{
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 25px rgba(16, 185, 129, 0.4);
        }}

        .brand-shield svg {{
            width: 30px;
            height: 30px;
            fill: #ffffff;
        }}

        .brand-titles h1 {{
            font-size: 24pt;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #ffffff;
            line-height: 1.1;
        }}

        .brand-titles span {{
            font-size: 10pt;
            color: #34d399;
            font-weight: 600;
            letter-spacing: 2px;
            text-transform: uppercase;
        }}

        .cover-hero {{
            margin: 12mm 0;
        }}

        .cover-hero h2 {{
            font-size: 26pt;
            font-weight: 800;
            line-height: 1.15;
            color: #ffffff;
            margin-bottom: 12px;
            letter-spacing: -0.8px;
        }}

        .cover-hero h2 span {{
            background: linear-gradient(135deg, #34d399 0%, #38bdf8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}

        .cover-hero p {{
            font-size: 11pt;
            color: #94a3b8;
            max-width: 650px;
            line-height: 1.6;
        }}

        .cover-author-card {{
            background: rgba(30, 41, 59, 0.85);
            border: 1.5px solid rgba(16, 185, 129, 0.5);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            padding: 18px 24px;
            margin-top: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .author-info h3 {{
            font-size: 16pt;
            color: #ffffff;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: -0.2px;
        }}

        .author-info p {{
            font-size: 10pt;
            color: #cbd5e1;
            margin-bottom: 2px;
        }}

        .author-badge-pill {{
            background: #064e3b;
            color: #6ee7b7;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 8.5pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1px solid #10b981;
        }}

        .cover-stats-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin-top: 25px;
        }}

        .cover-stat-box {{
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 14px 16px;
        }}

        .cover-stat-box .stat-num {{
            font-size: 18pt;
            font-weight: 800;
            color: #38bdf8;
            line-height: 1.2;
        }}

        .cover-stat-box .stat-num.accent {{
            color: #34d399;
        }}

        .cover-stat-box .stat-label {{
            font-size: 8.5pt;
            color: #94a3b8;
            font-weight: 600;
            margin-top: 4px;
            text-transform: uppercase;
        }}

        .cover-footer {{
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 8.5pt;
            color: #64748b;
        }}

        /* ================= CONTENT STYLES ================= */
        .section-header {{
            margin-bottom: 14px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            page-break-after: avoid;
            break-after: avoid;
        }}

        .section-header h2 {{
            font-size: 16pt;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.3px;
        }}

        .section-header .section-tag {{
            font-size: 8.5pt;
            font-weight: 700;
            color: #0284c7;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            background: #e0f2fe;
            padding: 4px 10px;
            border-radius: 6px;
        }}

        /* Sitemap & Architecture Flow Box */
        .sitemap-flow {{
            background: #f8fafc;
            border: 1.5px solid #cbd5e1;
            border-radius: 10px;
            padding: 14px 16px;
            margin-bottom: 20px;
        }}

        .sitemap-title {{
            font-size: 10pt;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .sitemap-grid {{
            display: grid;
            grid-template-columns: 1.1fr 0.9fr 1.6fr;
            gap: 12px;
        }}

        .sitemap-card {{
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
            border-top: 3px solid #0284c7;
        }}

        .sitemap-card.gateway {{ border-top-color: #10b981; }}
        .sitemap-card.app {{ border-top-color: #8b5cf6; }}

        .sitemap-card h5 {{
            font-size: 8.5pt;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
            text-transform: uppercase;
        }}

        .sitemap-card ul {{
            list-style: none;
            padding: 0;
            font-size: 7.8pt;
            color: #334155;
            line-height: 1.5;
        }}

        .sitemap-card ul li {{
            margin-bottom: 3px;
            display: flex;
            align-items: center;
            gap: 5px;
        }}

        .sitemap-pill {{
            background: #f1f5f9;
            color: #0284c7;
            font-family: 'JetBrains Mono', monospace;
            font-size: 7pt;
            padding: 1px 5px;
            border-radius: 3px;
            font-weight: 600;
        }}

        /* Executive Metrics Grid */
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }}

        .metric-card {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px 14px;
            border-top: 3.5px solid #0284c7;
        }}

        .metric-card.success {{ border-top-color: #10b981; }}
        .metric-card.warning {{ border-top-color: #f59e0b; }}
        .metric-card.purple  {{ border-top-color: #8b5cf6; }}

        .metric-value {{
            font-size: 17pt;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.1;
        }}

        .metric-label {{
            font-size: 8pt;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            margin-top: 4px;
        }}

        .metric-sub {{
            font-size: 7.5pt;
            color: #94a3b8;
            margin-top: 2px;
        }}

        /* Architecture Card */
        .arch-grid {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }}

        .arch-card {{
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }}

        .arch-card h4 {{
            font-size: 10pt;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
        }}

        .arch-card p {{
            font-size: 8pt;
            color: #475569;
            line-height: 1.4;
        }}

        .arch-card ul {{
            margin-top: 6px;
            padding-left: 14px;
            font-size: 7.8pt;
            color: #475569;
        }}

        /* Formula Box */
        .formula-box {{
            background: #f0fdf4;
            border: 1.5px solid #86efac;
            border-radius: 10px;
            padding: 12px 16px;
            margin-bottom: 18px;
        }}

        .formula-box h4 {{
            font-size: 10.5pt;
            font-weight: 700;
            color: #166534;
            margin-bottom: 4px;
        }}

        .formula-math {{
            font-family: 'JetBrains Mono', monospace;
            font-size: 9pt;
            background: #ffffff;
            border: 1px solid #bbf7d0;
            padding: 6px 10px;
            border-radius: 6px;
            color: #14532d;
            font-weight: 600;
            margin: 4px 0 6px 0;
            display: inline-block;
        }}

        .formula-desc {{
            font-size: 8pt;
            color: #15803d;
            line-height: 1.35;
        }}

        /* Tables */
        .data-table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-bottom: 12px;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }}

        .data-table th {{
            background: #0f172a;
            color: #ffffff;
            font-weight: 700;
            text-align: left;
            padding: 7px 8px;
            font-size: 7.8pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        .data-table td {{
            padding: 5px 8px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: top;
            color: #334155;
            line-height: 1.35;
        }}

        .data-table tr {{
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        .data-table tr:nth-child(even) td {{
            background-color: #f8fafc;
        }}

        .code-id {{
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            color: #0f172a;
            font-size: 7.8pt;
            white-space: nowrap;
        }}

        .task-title {{
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 2px;
        }}

        .task-criteria {{
            font-size: 7.5pt;
            color: #64748b;
            line-height: 1.3;
        }}

        .crit-label {{
            font-weight: 700;
            color: #475569;
        }}

        .dep-text {{
            font-family: 'JetBrains Mono', monospace;
            font-size: 7.5pt;
            color: #64748b;
        }}

        .desc-text {{
            font-size: 8pt;
            color: #475569;
        }}

        /* Badges */
        .badge {{
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 7pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            white-space: nowrap;
        }}

        .badge-done {{
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
        }}

        .badge-partial {{
            background-color: #fef3c7;
            color: #b45309;
            border: 1px solid #fcd34d;
        }}

        .badge-planned {{
            background-color: #e0f2fe;
            color: #0369a1;
            border: 1px solid #7dd3fc;
        }}

        .badge-review {{
            background-color: #f3e8ff;
            color: #7e22ce;
            border: 1px solid #d8b4fe;
        }}

        /* Priorities */
        .prio-tag {{
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 7pt;
            font-weight: 800;
            font-family: 'JetBrains Mono', monospace;
        }}

        .prio-p0 {{ background: #ffe4e6; color: #be123c; border: 1px solid #fca5a5; }}
        .prio-p1 {{ background: #ffedd5; color: #c2410c; border: 1px solid #fdba74; }}
        .prio-p2 {{ background: #fef9c3; color: #a16207; border: 1px solid #fde047; }}
        .prio-p3 {{ background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }}

        /* Subsystem Tags */
        .subsystem-tag {{
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 7pt;
            font-weight: 600;
        }}

        .sub-backend   {{ background: #eff6ff; color: #1d4ed8; }}
        .sub-frontend  {{ background: #ecfeff; color: #0e7490; }}
        .sub-database  {{ background: #fff7ed; color: #c2410c; }}
        .sub-security  {{ background: #f5f3ff; color: #6d28d9; }}
        .sub-devops    {{ background: #f0fdf4; color: #15803d; }}
        .sub-qa        {{ background: #fdf2f8; color: #be185d; }}
        .sub-fullstack {{ background: #faf5ff; color: #7e22ce; }}

        .effort-tag {{
            font-weight: 700;
            color: #475569;
            font-size: 7.5pt;
            font-family: 'JetBrains Mono', monospace;
        }}

        .persona-tag {{
            background: #f1f5f9;
            color: #334155;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 7.5pt;
            font-weight: 600;
        }}

        /* Phase Block */
        .phase-block {{
            margin-bottom: 20px;
        }}

        .phase-header {{
            background: #f8fafc;
            border-left: 5px solid #0f172a;
            border-radius: 0 8px 8px 0;
            padding: 8px 12px;
            margin-bottom: 8px;
            border-top: 1px solid #e2e8f0;
            border-right: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            page-break-after: avoid;
            break-after: avoid;
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        .phase-meta {{
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 4px;
        }}

        .sprint-tag {{
            font-size: 8pt;
            font-weight: 700;
            color: #0284c7;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        .phase-header h2 {{
            font-size: 13pt;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.2px;
            margin-bottom: 4px;
        }}

        .phase-objective {{
            font-size: 8.5pt;
            color: #475569;
            line-height: 1.4;
        }}

        /* What Platform Delivers / Outputs Box */
        .sprint-output-box {{
            background: #ffffff;
            border: 1.5px solid #cbd5e1;
            border-top: 3px solid #0f172a;
            border-radius: 8px;
            padding: 8px 12px;
            margin-top: 6px;
            margin-bottom: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.03);
            page-break-inside: avoid;
            break-inside: avoid;
        }}

        .sprint-output-header {{
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 4px;
        }}

        .output-icon {{
            font-size: 10pt;
        }}

        .sprint-output-header h4 {{
            font-size: 9pt;
            font-weight: 800;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }}

        .output-summary {{
            font-size: 8pt;
            color: #334155;
            line-height: 1.35;
            margin-bottom: 6px;
            background: #f8fafc;
            padding: 5px 8px;
            border-radius: 6px;
            border-left: 3px solid #38bdf8;
        }}

        .output-grid {{
            display: grid;
            grid-template-columns: 1.2fr 1.2fr 1.1fr;
            gap: 8px;
        }}

        .output-col {{
            background: #fafafa;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 6px 8px;
        }}

        .output-col-title {{
            font-size: 7.5pt;
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-bottom: 3px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 2px;
        }}

        .output-col ul {{
            padding-left: 12px;
            font-size: 7.5pt;
            color: #475569;
            line-height: 1.3;
        }}

        .output-col ul li {{
            margin-bottom: 1px;
        }}

        .output-impact-text {{
            font-size: 7.5pt;
            color: #1e293b;
            line-height: 1.35;
            font-weight: 500;
        }}

        /* Sign-off Block */
        .signoff-box {{
            background: #ffffff;
            border: 2px solid #0f172a;
            border-radius: 12px;
            padding: 18px 22px;
            margin-top: 25px;
            page-break-inside: avoid;
        }}

        .signoff-grid {{
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 16px;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
        }}

        .signoff-item h5 {{
            font-size: 8pt;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 4px;
        }}

        .signoff-item p {{
            font-size: 10pt;
            font-weight: 700;
            color: #0f172a;
        }}
    </style>
</head>
<body>

    <!-- ================= COVER PAGE ================= -->
    <div class="cover-page">
        <div>
            <div class="cover-brand">
                <div class="brand-shield">
                    <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                </div>
                <div class="brand-titles">
                    <h1>NEXTRISK AI</h1>
                    <span>Enterprise Cybersecurity Platform (TRUVIA)</span>
                </div>
            </div>

            <div class="cover-hero">
                <h2>Master Sprint Implementation Plan &amp; <span>Architecture Roadmap</span></h2>
                <p>A unified blueprint bridging Public Web Presence (Home, Solutions, Pricing, About, Contact) and Enterprise Cyber Operations (GRC, SOC, Penetration Testing &amp; Predictive AI Decision Models).</p>
            </div>
        </div>

        <div>
            <!-- Author Attribution Card (English Only) -->
            <div class="cover-author-card">
                <div class="author-info">
                    <div style="font-size: 8.5pt; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 2px;">Project Architect &amp; Engineering Lead</div>
                    <h3>Mohamed Shosha</h3>
                    <p>Lead Technical Architect &amp; Systems Engineer</p>
                    <p style="font-size: 8.5pt; color: #94a3b8;">Document Version: 2.0.0 &bull; Classification: Enterprise Confidential</p>
                </div>
                <div>
                    <span class="author-badge-pill">Master Roadmap</span>
                </div>
            </div>

            <div class="cover-stats-grid">
                <div class="cover-stat-box">
                    <div class="stat-num accent">96 Tasks</div>
                    <div class="stat-label">Granular Scope</div>
                </div>
                <div class="cover-stat-box">
                    <div class="stat-num">10 Sprints</div>
                    <div class="stat-label">Phases 0 to 9</div>
                </div>
                <div class="cover-stat-box">
                    <div class="stat-num accent">19 FRs</div>
                    <div class="stat-label">Public + App</div>
                </div>
                <div class="cover-stat-box">
                    <div class="stat-num">31% Verified</div>
                    <div class="stat-label">74 Tests Passing</div>
                </div>
            </div>
        </div>

        <div class="cover-footer">
            <span>&copy; 2026 NextRisk AI Project &bull; Mohamed Shosha</span>
            <span>Stack: Spring Boot 3.3.5 &bull; React 18 &bull; MySQL 8 &bull; Spring AI &bull; Docker</span>
        </div>
    </div>

    <!-- ================= PAGE 2: EXECUTIVE SUMMARY & SITEMAP ARCHITECTURE ================= -->
    <div class="page-break">
        <div class="section-header">
            <div>
                <h2>1. Executive Summary &amp; Platform Sitemap Architecture</h2>
                <p style="color: #64748b; font-size: 8.5pt;">Complete mapping of the Public Marketing Website, Authentication Gateway, and Core Cyber Application</p>
            </div>
            <span class="section-tag">Platform Overview</span>
        </div>

        <!-- Sitemap Flowchart Card -->
        <div class="sitemap-flow">
            <div class="sitemap-title">
                🌐 Complete Platform Sitemap &amp; User Navigation Architecture
            </div>
            <div class="sitemap-grid">
                <div class="sitemap-card">
                    <h5>1. Public Website (Visitors)</h5>
                    <ul>
                        <li><span class="sitemap-pill">/</span> <strong>Home Page</strong> (Hero, Solutions, Risk Widget)</li>
                        <li><span class="sitemap-pill">/services</span> <strong>Services &amp; Solutions</strong> (GRC, SOC, AI)</li>
                        <li><span class="sitemap-pill">/pricing</span> <strong>Pricing Plans</strong> (Tiers &amp; Comparison)</li>
                        <li><span class="sitemap-pill">/about</span> <strong>About Us</strong> (Mission &amp; Leadership)</li>
                        <li><span class="sitemap-pill">/contact</span> <strong>Contact Us</strong> (Inquiry &amp; FAQ)</li>
                        <li><span class="sitemap-pill">Modal</span> <strong>Book a Demo</strong> (Calendar scheduler)</li>
                    </ul>
                </div>
                <div class="sitemap-card gateway">
                    <h5>2. Auth Gateway</h5>
                    <ul>
                        <li><span class="sitemap-pill">/login</span> <strong>User Login</strong> (JWT &amp; Cookie)</li>
                        <li><span class="sitemap-pill">/register</span> <strong>Registration</strong> (Validation)</li>
                        <li><span class="sitemap-pill">/profile</span> <strong>User Profile</strong> (Active sessions)</li>
                        <li><span class="sitemap-pill">/admin</span> <strong>Admin Probe</strong> (RBAC verify)</li>
                        <li><span class="sitemap-pill">/403</span> <strong>Forbidden Page</strong></li>
                        <li><span class="sitemap-pill">/404</span> <strong>Not Found Page</strong></li>
                    </ul>
                </div>
                <div class="sitemap-card app">
                    <h5>3. Enterprise Cyber Workspace (Protected)</h5>
                    <ul>
                        <li><span class="sitemap-pill">/dashboard</span> <strong>Executive CISO View</strong> (Exposure &amp; Posture)</li>
                        <li><span class="sitemap-pill">/dashboard/soc</span> <strong>SOC Live Telemetry</strong> (Alert stream &amp; MTTR)</li>
                        <li><span class="sitemap-pill">/assets</span> <strong>Asset Inventory</strong> (Classification &amp; Criticality)</li>
                        <li><span class="sitemap-pill">/vulnerabilities</span> <strong>Vulnerability Explorer</strong> (Pentest ingestion)</li>
                        <li><span class="sitemap-pill">/risks</span> <strong>Central Risk Register</strong> (5x5 Live Heatmap)</li>
                        <li><span class="sitemap-pill">/compliance</span> <strong>Frameworks &amp; Controls</strong> (ISO 27001, NIST)</li>
                        <li><span class="sitemap-pill">/policies</span> <strong>Policy Repository</strong> (Versioning &amp; Approval)</li>
                        <li><span class="sitemap-pill">/incidents</span> <strong>Incident Response</strong> (Kanban &amp; SLA timers)</li>
                        <li><span class="sitemap-pill">/ai-assistant</span> <strong>NextRisk AI Copilot</strong> (Remediation playbooks)</li>
                        <li><span class="sitemap-pill">/reports</span> <strong>Board Reports</strong> (PDF / CSV export)</li>
                        <li><span class="sitemap-pill">/audit</span> <strong>Immutable Audit Trail</strong> (Activity logging)</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Metrics Grid -->
        <div class="metrics-grid">
            <div class="metric-card success">
                <div class="metric-value">26 Tasks</div>
                <div class="metric-label">Completed &amp; Verified</div>
                <div class="metric-sub">Phases 0 &amp; 1 Fully Operational</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">70 Tasks</div>
                <div class="metric-label">Remaining Sprints</div>
                <div class="metric-sub">Phases 2 through 9 Roadmap</div>
            </div>
            <div class="metric-card warning">
                <div class="metric-value">Sprint 2</div>
                <div class="metric-label">Immediate Milestone</div>
                <div class="metric-sub">Public Website (Home, Services, Contact)</div>
            </div>
            <div class="metric-card purple">
                <div class="metric-value">74 Tests</div>
                <div class="metric-label">Automated Green Tests</div>
                <div class="metric-sub">38 Backend / 36 Frontend</div>
            </div>
        </div>

        <!-- Dynamic Risk Scoring Blueprint -->
        <div class="formula-box">
            <h4>NextRisk AI Dynamic Algorithmic Scoring Blueprint</h4>
            <div class="formula-math">
                Live Risk Score = [ (Asset Criticality &times; 0.35) + (CVSS v3 Base &times; 0.35) + (Threat Likelihood &times; 0.20) ] &times; (1 - Control Effectiveness &times; 0.70)
            </div>
            <p class="formula-desc">
                The core engine recalculates live risk scores whenever an asset tier, linked vulnerability, or compensating control is updated. The score is normalized from <strong>1 to 100</strong> and projected into financial exposure using the <strong>FAIR (Factor Analysis of Information Risk)</strong> model: <code>ALE = SLE &times; ARO</code> ($ USD).
            </p>
        </div>
    </div>

    <!-- ================= PAGE 3: FUNCTIONAL REQUIREMENTS MATRIX ================= -->
    <div class="page-break">
        <div class="section-header">
            <div>
                <h2>2. Functional Requirements (FR) Traceability Matrix</h2>
                <p style="color: #64748b; font-size: 8.5pt;">Complete mapping of core platform capabilities (FR-WEB-01..05 and FR-01..14) to project personas and execution sprints.</p>
            </div>
            <span class="section-tag">Requirements Matrix</span>
        </div>

        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 10%;">ID</th>
                    <th style="width: 25%;">Requirement Name</th>
                    <th style="width: 17%;">Target Persona</th>
                    <th style="width: 14%;">Target Sprint</th>
                    <th style="width: 12%;">Status</th>
                    <th style="width: 22%;">Architectural Scope &amp; Deliverables</th>
                </tr>
            </thead>
            <tbody>
                {fr_rows}
            </tbody>
        </table>
    </div>

    <!-- ================= PAGES 4+: MASTER SPRINT ROADMAP ================= -->
    <div class="section-header">
        <div>
            <h2>3. Master Sprint Execution Roadmap &amp; Task Backlog</h2>
            <p style="color: #64748b; font-size: 8.5pt;">Granular engineering breakdown of all 96 project tasks across Phases 0 through 9 with explicit platform capabilities &amp; deliverables.</p>
        </div>
        <span class="section-tag">96 Detailed Tasks</span>
    </div>

    {phases_html}

    <!-- ================= FINAL PAGE: IMMEDIATE NEXT SPRINT & SIGN-OFF ================= -->
    <div class="page-break-before">
        <div class="section-header">
            <div>
                <h2>4. Immediate Resumption Plan &amp; Document Governance</h2>
                <p style="color: #64748b; font-size: 8.5pt;">Actionable restart checklist for Sprint 2 (Phase 2: Public Website &amp; Marketing Portal) and formal sign-off.</p>
            </div>
            <span class="section-tag">Execution Strategy</span>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
            <h3 style="font-size: 11pt; color: #0f172a; margin-bottom: 8px;">Sprint 2 (Phase 2: Public Website &amp; Landing Pages) — Immediate Execution Checklist</h3>
            <p style="font-size: 8.5pt; color: #475569; margin-bottom: 12px;">When active feature development begins, build the public website in the following strict sequential dependency order:</p>
            
            <ol style="padding-left: 20px; font-size: 8.5pt; color: #334155; line-height: 1.6;">
                <li><strong>Step 1 (FE-NAV-001 &amp; FE-FOOT-001):</strong> Build <code>PublicNavbar.jsx</code> with brand crest, navigation links (Home, Services, Pricing, About, Contact), ThemeToggle, and 'Sign In' / 'Get Started' buttons; and <code>PublicFooter.jsx</code> with complete sitemap and newsletter signup.</li>
                <li><strong>Step 2 (FE-HOME-001 &amp; FE-HOME-002):</strong> Build <code>HomePage.jsx</code> with an impactful Hero banner, cybersecurity value proposition, and the 4 interactive solution cards (GRC, SOC, Pentest, AI).</li>
                <li><strong>Step 3 (FE-HOME-003):</strong> Implement the <code>InteractiveRiskSimulator.jsx</code> component on the Home Page, allowing prospective visitors to adjust sliders and preview live risk score calculation in real time.</li>
                <li><strong>Step 4 (FE-SERV-001 &amp; FE-PRICE-001):</strong> Create <code>ServicesPage.jsx</code> detailing the platform's cybersecurity modules, and <code>PricingPage.jsx</code> with Community, Starter, and Enterprise tier cards with monthly/annual billing toggle.</li>
                <li><strong>Step 5 (FE-ABOUT-001, FE-CONT-001 &amp; FE-DEMO-001):</strong> Build <code>AboutPage.jsx</code> featuring project leadership by Mohamed Shosha, <code>ContactPage.jsx</code> with validated inquiry form and FAQ accordion, and <code>BookDemoModal.jsx</code> for scheduling product walkthroughs.</li>
            </ol>
        </div>

        <!-- Document Sign-off Box (English Only) -->
        <div class="signoff-box">
            <h3 style="font-size: 11.5pt; color: #0f172a; font-weight: 800;">Document Approval &amp; Architecture Sign-off</h3>
            <p style="font-size: 8.5pt; color: #64748b; margin-top: 2px;">This document represents the master development specification and sprint backlog for NextRisk AI (TRUVIA).</p>
            
            <div class="signoff-grid">
                <div class="signoff-item">
                    <h5>Project Architect &amp; Engineering Lead</h5>
                    <p>Mohamed Shosha</p>
                    <span style="font-size: 8pt; color: #64748b;">Lead Solutions Architect &bull; NextRisk AI</span>
                </div>
                <div class="signoff-item">
                    <h5>Status &amp; Approval</h5>
                    <p style="color: #059669;">APPROVED</p>
                    <span style="font-size: 8pt; color: #64748b;">Active Development Roadmap (v2.0.0)</span>
                </div>
                <div class="signoff-item">
                    <h5>Release Date</h5>
                    <p>October 2026</p>
                    <span style="font-size: 8pt; color: #64748b;">Version 2.0.0</span>
                </div>
            </div>
        </div>
    </div>

</body>
</html>
"""
    return html

def main():
    print("[*] Generating Comprehensive HTML Document...")
    html_content = generate_html()
    
    with open(HTML_OUTPUT, "w", encoding="utf-8") as f:
        f.write(html_content)
    print(f"[+] HTML generated successfully: {HTML_OUTPUT}")
    
    print("[*] Compiling to PDF via Headless Chrome...")
    cmd = [
        CHROME_PATH,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF_OUTPUT}",
        str(HTML_OUTPUT)
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and PDF_OUTPUT.exists():
        size_kb = PDF_OUTPUT.stat().st_size / 1024
        print(f"[+] PDF compiled successfully!")
        print(f"    Path: {PDF_OUTPUT}")
        print(f"    Size: {size_kb:.1f} KB")
    else:
        print(f"[-] PDF compilation failed with code {res.returncode}")
        print(f"    stdout: {res.stdout}")
        print(f"    stderr: {res.stderr}")
        sys.exit(1)

if __name__ == "__main__":
    main()
