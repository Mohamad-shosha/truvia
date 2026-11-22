package com.nextrisk.risk.service;

import com.nextrisk.risk.RiskEnums.Level;
import com.nextrisk.risk.entity.Risk;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/** Posture figures computed from a set of active risks. */
public record RiskPosture(int activeRisks, int highRisks, int criticalRisks, BigDecimal riskScore) {

    /** Organisational risk score: mean residual score (1-25) of active risks, normalised to 0-100. */
    public static RiskPosture of(List<Risk> activeRisks) {
        int high = 0;
        int critical = 0;
        int total = 0;
        for (Risk r : activeRisks) {
            Level level = r.residualLevel();
            if (level.atLeastHigh()) {
                high++;
            }
            if (level == Level.CRITICAL) {
                critical++;
            }
            total += r.residualScore();
        }
        BigDecimal score = activeRisks.isEmpty() ? BigDecimal.ZERO.setScale(1)
                : BigDecimal.valueOf(total * 100L)
                        .divide(BigDecimal.valueOf(activeRisks.size() * 25L), 1, RoundingMode.HALF_UP);
        return new RiskPosture(activeRisks.size(), high, critical, score);
    }
}
