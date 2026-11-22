package com.nextrisk.risk;

/** Value types of the risk register. */
public final class RiskEnums {

    private RiskEnums() {
    }

    public enum Status { OPEN, IN_PROGRESS, CLOSED }

    public enum Treatment { MITIGATE, ACCEPT, TRANSFER, AVOID }

    /**
     * Band of a likelihood x impact score (1-25), matching the 5x5 heat map:
     * 1-4 low, 5-9 medium, 10-15 high, 16-25 critical.
     */
    public enum Level {
        LOW, MEDIUM, HIGH, CRITICAL;

        public static Level of(int score) {
            if (score >= 16) {
                return CRITICAL;
            }
            if (score >= 10) {
                return HIGH;
            }
            if (score >= 5) {
                return MEDIUM;
            }
            return LOW;
        }

        public boolean atLeastHigh() {
            return this == HIGH || this == CRITICAL;
        }
    }
}
