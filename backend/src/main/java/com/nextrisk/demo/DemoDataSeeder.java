package com.nextrisk.demo;

import com.nextrisk.activity.ActivityEvent;
import com.nextrisk.activity.ActivityEventRepository;
import com.nextrisk.risk.RiskEnums.Status;
import com.nextrisk.risk.RiskEnums.Treatment;
import com.nextrisk.risk.entity.Risk;
import com.nextrisk.risk.entity.RiskSnapshot;
import com.nextrisk.risk.repository.RiskRepository;
import com.nextrisk.risk.repository.RiskSnapshotRepository;
import com.nextrisk.risk.service.RiskPosture;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fills an EMPTY risk register with realistic sample data so the dashboard can be demonstrated before real
 * data exists. Enabled only with {@code nextrisk.demo-data.enabled=true}. Every row it writes is flagged
 * {@code sample = 1}; the UI labels it as sample data, and it can be removed with three DELETE statements
 * (see V5 migration). It never runs when any risk already exists.
 */
@Component
@ConditionalOnProperty(name = "nextrisk.demo-data.enabled", havingValue = "true")
public class DemoDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final int HISTORY_DAYS = 90;

    /** title, category, business service, owner, L, I, residual L, residual I, treatment, status, created days ago, closed days ago (-1 = open). */
    private record Sample(String title, String category, String service, String owner, int l, int i, int rl, int ri,
            Treatment treatment, Status status, int createdDaysAgo, int closedDaysAgo) {
    }

    private static final List<Sample> SAMPLES = List.of(
            new Sample("AI-Driven Attacks & Deepfake Fraud", "Threat & AI Security", "Executive Communications & Finance", "CISO / SecOps", 5, 5, 4, 5, Treatment.MITIGATE, Status.IN_PROGRESS, 84, -1),
            new Sample("Multi-Extortion Ransomware", "Ransomware & Malware", "Core Infrastructure & Datacenter", "Head of IT Operations", 5, 5, 4, 4, Treatment.MITIGATE, Status.IN_PROGRESS, 88, -1),
            new Sample("Software Supply Chain Vulnerabilities", "Supply Chain", "Customer Cloud SaaS & CI/CD", "Third-Party Risk Lead", 4, 5, 3, 4, Treatment.MITIGATE, Status.OPEN, 70, -1),
            new Sample("Identity & Credential Abuse", "Identity & IAM", "Enterprise SSO & Hybrid Workspace", "IAM Administrator", 5, 4, 3, 4, Treatment.MITIGATE, Status.IN_PROGRESS, 65, -1),
            new Sample("Cloud Infrastructure Misconfigurations", "Cloud Security", "AWS Production Workloads", "Cloud Security Architect", 4, 4, 3, 4, Treatment.MITIGATE, Status.OPEN, 52, -1),
            new Sample("Unpatched Internet-Facing VPN Gateway", "Vulnerability Management", "Remote Access", "Network Security Lead", 4, 5, 3, 3, Treatment.MITIGATE, Status.IN_PROGRESS, 21, -1),
            new Sample("Business Email Compromise", "Fraud & Social Engineering", "Finance & Payments", "CFO Office", 4, 4, 2, 4, Treatment.MITIGATE, Status.OPEN, 47, -1),
            new Sample("Insider Data Exfiltration", "Data Protection", "Customer Data Platform", "Data Protection Officer", 3, 5, 2, 4, Treatment.MITIGATE, Status.OPEN, 39, -1),
            new Sample("Third-Party Payroll Provider Breach", "Third-Party", "HR & Payroll", "Third-Party Risk Lead", 3, 4, 3, 3, Treatment.TRANSFER, Status.OPEN, 33, -1),
            new Sample("DDoS Against Customer Portal", "Availability", "Customer Portal", "SRE Manager", 3, 4, 2, 3, Treatment.MITIGATE, Status.IN_PROGRESS, 28, -1),
            new Sample("Legacy ERP End of Support", "Operational", "ERP & Finance", "Head of IT Operations", 4, 3, 3, 3, Treatment.AVOID, Status.OPEN, 60, -1),
            new Sample("Weak MFA Coverage for Contractors", "Identity & IAM", "Enterprise SSO & Hybrid Workspace", "IAM Administrator", 4, 3, 2, 3, Treatment.MITIGATE, Status.IN_PROGRESS, 18, -1),
            new Sample("GDPR Data Retention Non-Compliance", "Compliance", "Customer Data Platform", "Data Protection Officer", 3, 4, 2, 3, Treatment.MITIGATE, Status.OPEN, 44, -1),
            new Sample("Shadow IT SaaS Usage", "Cloud Security", "Corporate SaaS Estate", "IT Governance Lead", 3, 3, 2, 3, Treatment.MITIGATE, Status.OPEN, 26, -1),
            new Sample("Backup Restore Not Tested", "Operational", "Core Infrastructure & Datacenter", "Backup Administrator", 3, 4, 2, 2, Treatment.MITIGATE, Status.IN_PROGRESS, 14, -1),
            new Sample("Mobile Device Loss", "Data Protection", "Hybrid Workspace", "Endpoint Security Lead", 3, 3, 2, 2, Treatment.ACCEPT, Status.OPEN, 57, -1),
            new Sample("Physical Access to Branch Offices", "Physical Security", "Branch Network", "Facilities Security", 2, 3, 2, 2, Treatment.ACCEPT, Status.OPEN, 75, -1),
            new Sample("Outdated TLS on Partner API", "Vulnerability Management", "Partner Integration API", "Platform Engineering", 3, 3, 1, 3, Treatment.MITIGATE, Status.OPEN, 9, -1),
            new Sample("Phishing Campaign Targeting HR", "Fraud & Social Engineering", "HR & Payroll", "Security Awareness Lead", 4, 3, 2, 2, Treatment.MITIGATE, Status.CLOSED, 80, 40),
            new Sample("Exposed S3 Bucket with Logs", "Cloud Security", "AWS Production Workloads", "Cloud Security Architect", 5, 4, 1, 2, Treatment.MITIGATE, Status.CLOSED, 77, 58),
            new Sample("Log4Shell in Internal Tools", "Vulnerability Management", "Internal Tooling", "Platform Engineering", 4, 5, 1, 3, Treatment.MITIGATE, Status.CLOSED, 89, 62),
            new Sample("Default Credentials on IoT Cameras", "Physical Security", "Branch Network", "Facilities Security", 4, 3, 1, 2, Treatment.MITIGATE, Status.CLOSED, 50, 20),
            new Sample("Unencrypted Laptop Fleet", "Data Protection", "Hybrid Workspace", "Endpoint Security Lead", 3, 4, 1, 2, Treatment.MITIGATE, Status.CLOSED, 68, 11),
            new Sample("Stale Privileged Accounts", "Identity & IAM", "Enterprise SSO & Hybrid Workspace", "IAM Administrator", 4, 4, 1, 3, Treatment.MITIGATE, Status.CLOSED, 35, 4));

    private final RiskRepository risks;
    private final RiskSnapshotRepository snapshots;
    private final ActivityEventRepository activity;

    public DemoDataSeeder(RiskRepository risks, RiskSnapshotRepository snapshots, ActivityEventRepository activity) {
        this.risks = risks;
        this.snapshots = snapshots;
        this.activity = activity;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (risks.count() > 0) {
            return;
        }
        Instant now = Instant.now();
        List<Risk> created = new ArrayList<>();
        for (Sample s : SAMPLES) {
            Risk r = new Risk(now.minus(Duration.ofDays(s.createdDaysAgo())).minus(Duration.ofHours(s.title().length() % 9)));
            r.setTitle(s.title());
            r.setDescription("Sample risk for demonstration. Replace with your organisation's real register.");
            r.setCategory(s.category());
            r.setBusinessService(s.service());
            r.setOwner(s.owner());
            r.setLikelihood(s.l());
            r.setImpact(s.i());
            r.setResidualLikelihood(s.rl());
            r.setResidualImpact(s.ri());
            r.setTreatment(s.treatment());
            r.changeStatus(s.status(), now);
            if (s.closedDaysAgo() >= 0) {
                r.setClosedAt(now.minus(Duration.ofDays(s.closedDaysAgo())));
            }
            r.setUpdatedAt(s.closedDaysAgo() >= 0 ? r.getClosedAt() : now.minus(Duration.ofDays(s.createdDaysAgo() / 3)));
            r.setSample(true);
            r = risks.saveAndFlush(r);
            r.setCode(String.format("RSK-%03d", r.getId()));
            created.add(risks.save(r));
        }

        // Daily history reconstructed from the samples' own lifecycle (what was open on each past day).
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        for (int d = HISTORY_DAYS; d >= 1; d--) {
            LocalDate day = today.minusDays(d);
            Instant endOfDay = day.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
            List<Risk> openThen = created.stream()
                    .filter(r -> r.getCreatedAt().isBefore(endOfDay))
                    .filter(r -> r.getClosedAt() == null || !r.getClosedAt().isBefore(endOfDay))
                    .toList();
            RiskPosture p = RiskPosture.of(openThen);
            RiskSnapshot snap = snapshots.findById(day).orElseGet(() -> new RiskSnapshot(day));
            snap.update(p.activeRisks(), p.highRisks(), p.criticalRisks(), p.riskScore(), true);
            snapshots.save(snap);
        }

        String[][] events = {
            {"RISK_STATUS", "RSK-024 moved to Closed", "Stale Privileged Accounts · access review completed", "Sarah K.", "96"},
            {"RISK_UPDATED", "RSK-006 updated", "Unpatched Internet-Facing VPN Gateway · assigned for CVE validation", "Omar H.", "20"},
            {"RISK_CREATED", "RSK-018 created", "Outdated TLS on Partner API · MEDIUM residual risk", "Gina R.", "6"},
            {"RISK_UPDATED", "RSK-001 updated", "AI-Driven Attacks & Deepfake Fraud · executive verification step added", "Cleo M.", "3"},
        };
        for (String[] e : events) {
            activity.save(new ActivityEvent(null, e[3], e[0], e[1], e[2], true,
                    now.minus(Duration.ofHours(Long.parseLong(e[4])))));
        }
        log.warn("Demo data seeded: {} sample risks, {} days of history. Disable with DEMO_DATA_ENABLED=false.",
                created.size(), HISTORY_DAYS);
    }
}
