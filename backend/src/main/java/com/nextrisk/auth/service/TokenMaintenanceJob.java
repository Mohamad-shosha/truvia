package com.nextrisk.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Daily purge of refresh tokens that expired more than a day ago (SEC-001).
 * Sign-in history is kept separately in login_events, so purging never affects dashboard trends.
 */
@Configuration
@EnableScheduling
public class TokenMaintenanceJob {

    private static final Logger log = LoggerFactory.getLogger(TokenMaintenanceJob.class);

    private final RefreshTokenService refreshTokens;

    public TokenMaintenanceJob(RefreshTokenService refreshTokens) {
        this.refreshTokens = refreshTokens;
    }

    @Scheduled(cron = "${nextrisk.maintenance.token-purge-cron:0 0 3 * * *}", zone = "UTC")
    public void purgeExpiredRefreshTokens() {
        int removed = refreshTokens.purgeExpired();
        log.info("Purged expired refresh tokens (removed={})", removed);
    }
}
