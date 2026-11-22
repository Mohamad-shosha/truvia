package com.nextrisk.auth.service;

import com.nextrisk.auth.dto.SessionResponse;
import com.nextrisk.auth.entity.RefreshToken;
import com.nextrisk.auth.repository.RefreshTokenRepository;
import com.nextrisk.common.ApiException;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lets a user see and sign out their own sessions. A session is a refresh-token rotation family;
 * its live head is the single token in the family that is neither revoked nor expired.
 */
@Service
public class SessionService {

    private static final Logger log = LoggerFactory.getLogger(SessionService.class);

    private final RefreshTokenRepository repository;
    private final RefreshTokenService refreshTokens;

    public SessionService(RefreshTokenRepository repository, RefreshTokenService refreshTokens) {
        this.repository = repository;
        this.refreshTokens = refreshTokens;
    }

    @Transactional(readOnly = true)
    public List<SessionResponse> listActive(long userId, String currentRefreshToken) {
        Instant now = Instant.now();
        List<RefreshToken> heads = repository.findActiveForUser(userId, now);
        if (heads.isEmpty()) {
            return List.of();
        }
        Map<String, Instant> startedAt = new HashMap<>();
        for (Object[] row : repository.findFamilyStartTimes(heads.stream().map(RefreshToken::getFamilyId).toList())) {
            startedAt.put((String) row[0], (Instant) row[1]);
        }
        String currentFamily = refreshTokens.familyOf(currentRefreshToken).orElse(null);
        return heads.stream()
                .map(t -> new SessionResponse(
                        t.getFamilyId(),
                        startedAt.getOrDefault(t.getFamilyId(), t.getCreatedAt()),
                        t.getCreatedAt(),
                        t.getExpiresAt(),
                        t.isRememberMe(),
                        t.getFamilyId().equals(currentFamily)))
                .toList();
    }

    /** Signs out one of the caller's own sessions. Sessions of other users are reported as not found. */
    @Transactional
    public void revoke(long userId, String sessionId) {
        if (sessionId == null || !repository.existsByFamilyIdAndUser_Id(sessionId, userId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Session not found");
        }
        repository.revokeFamily(sessionId, Instant.now());
        log.info("User signed out a session (userId={})", userId);
    }

    /** Signs out every session of the caller except the one making the request. */
    @Transactional
    public int revokeOthers(long userId, String currentRefreshToken) {
        Instant now = Instant.now();
        return refreshTokens.familyOf(currentRefreshToken)
                .map(family -> repository.revokeAllForUserExceptFamily(userId, family, now))
                .orElseGet(() -> repository.revokeAllForUser(userId, now));
    }
}
