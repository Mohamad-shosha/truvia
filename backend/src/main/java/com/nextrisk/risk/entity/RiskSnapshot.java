package com.nextrisk.risk.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

/** Risk posture at the end of one UTC day (today's row is refreshed on every change). */
@Entity
@Table(name = "risk_snapshots")
public class RiskSnapshot {

    @Id
    @Column(name = "snapshot_date")
    private LocalDate date;

    @Column(name = "active_risks", nullable = false)
    private int activeRisks;

    @Column(name = "high_risks", nullable = false)
    private int highRisks;

    @Column(name = "critical_risks", nullable = false)
    private int criticalRisks;

    @Column(name = "risk_score", nullable = false, precision = 5, scale = 1)
    private BigDecimal riskScore;

    @Column(nullable = false)
    private boolean sample;

    protected RiskSnapshot() {
    }

    public RiskSnapshot(LocalDate date) {
        this.date = date;
    }

    public void update(int activeRisks, int highRisks, int criticalRisks, BigDecimal riskScore, boolean sample) {
        this.activeRisks = activeRisks;
        this.highRisks = highRisks;
        this.criticalRisks = criticalRisks;
        this.riskScore = riskScore;
        this.sample = sample;
    }

    public LocalDate getDate() { return date; }
    public int getActiveRisks() { return activeRisks; }
    public int getHighRisks() { return highRisks; }
    public int getCriticalRisks() { return criticalRisks; }
    public BigDecimal getRiskScore() { return riskScore; }
    public boolean isSample() { return sample; }
}
