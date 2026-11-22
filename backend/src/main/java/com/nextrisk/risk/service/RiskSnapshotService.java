package com.nextrisk.risk.service;

import com.nextrisk.risk.RiskEnums.Status;
import com.nextrisk.risk.entity.RiskSnapshot;
import com.nextrisk.risk.repository.RiskRepository;
import com.nextrisk.risk.repository.RiskSnapshotRepository;
import java.time.LocalDate;
import java.time.ZoneOffset;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Keeps one posture snapshot per UTC day. Today's row is rewritten after every risk change, at startup and
 * shortly after midnight, so yesterday's final state is preserved as history for trends and deltas.
 */
@Service
public class RiskSnapshotService {

    private final RiskRepository risks;
    private final RiskSnapshotRepository snapshots;

    public RiskSnapshotService(RiskRepository risks, RiskSnapshotRepository snapshots) {
        this.risks = risks;
        this.snapshots = snapshots;
    }

    @Transactional
    public RiskSnapshot recordToday() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        RiskPosture p = RiskPosture.of(risks.findByStatusNot(Status.CLOSED));
        RiskSnapshot snap = snapshots.findById(today).orElseGet(() -> new RiskSnapshot(today));
        snap.update(p.activeRisks(), p.highRisks(), p.criticalRisks(), p.riskScore(), false);
        return snapshots.save(snap);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        recordToday();
    }

    @Scheduled(cron = "0 5 0 * * *", zone = "UTC")
    public void daily() {
        recordToday();
    }
}
