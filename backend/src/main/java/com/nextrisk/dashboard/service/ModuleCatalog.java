package com.nextrisk.dashboard.service;

import com.nextrisk.auth.entity.Role;
import com.nextrisk.dashboard.dto.DashboardDtos.ModuleStatus;
import java.util.Collection;
import java.util.List;
import java.util.Set;

/**
 * Which platform modules each role works with, and whether each module exists yet.
 * When a module ships, flip it to {@link #available} with its route; the dashboard picks it up automatically.
 * Phase numbers follow docs/TASK_BACKLOG.md.
 */
final class ModuleCatalog {

    private record Entry(String key, String title, String description, Set<String> roles, String path,
            String plannedFor) {

        ModuleStatus toStatus() {
            return new ModuleStatus(key, title, description, path != null ? "AVAILABLE" : "PLANNED", path,
                    path != null ? null : plannedFor);
        }
    }

    private static Entry available(String key, String title, String description, String path, String... roles) {
        return new Entry(key, title, description, Set.of(roles), path, null);
    }

    private static Entry planned(String key, String title, String description, String phase, String... roles) {
        return new Entry(key, title, description, Set.of(roles), null, phase);
    }

    private static final List<Entry> ENTRIES = List.of(
            available("users", "User Administration",
                    "Provision employee accounts, assign roles and manage access.", "/admin",
                    Role.ADMIN),
            planned("assets", "Asset Inventory",
                    "Servers, applications and cloud services with business criticality.", "Phase 3",
                    Role.ADMIN, Role.CISO, Role.GRC_ANALYST, Role.SOC_ANALYST, Role.PENTESTER),
            planned("vulnerabilities", "Vulnerabilities & Pentest Findings",
                    "Ingest pentest reports and track findings by CVSS severity.", "Phase 3",
                    Role.CISO, Role.GRC_ANALYST, Role.SOC_ANALYST, Role.PENTESTER),
            planned("risks", "Risk Register & Live Scoring",
                    "Central risk register with dynamic 0-100 scoring and a 5x5 heatmap.", "Phase 4",
                    Role.CISO, Role.GRC_ANALYST, Role.SOC_ANALYST),
            planned("compliance", "Compliance & Policies",
                    "ISO 27001, NIST CSF and SOC 2 control posture and policy lifecycle.", "Phase 5",
                    Role.CISO, Role.GRC_ANALYST),
            planned("incidents", "Incident Response",
                    "Triage board, SLA timers and incident timelines.", "Phase 6",
                    Role.CISO, Role.SOC_ANALYST),
            planned("ai", "AI Remediation Advisor",
                    "Predicted attack vectors and generated remediation playbooks.", "Phase 7",
                    Role.CISO, Role.GRC_ANALYST, Role.SOC_ANALYST, Role.PENTESTER),
            planned("reports", "Executive Reports",
                    "Board-ready PDF and CSV reports on exposure and posture.", "Phase 8",
                    Role.CISO),
            planned("audit", "Audit Log",
                    "Who did what and when, across the whole platform.", "Phase 9",
                    Role.ADMIN, Role.CISO));

    private ModuleCatalog() {
    }

    /** Modules relevant to any of the given roles, available ones first, then in roadmap order. */
    static List<ModuleStatus> forRoles(Collection<String> roles) {
        return ENTRIES.stream()
                .filter(e -> e.roles().stream().anyMatch(roles::contains))
                .sorted((a, b) -> Boolean.compare(b.path() != null, a.path() != null))
                .map(Entry::toStatus)
                .toList();
    }
}
