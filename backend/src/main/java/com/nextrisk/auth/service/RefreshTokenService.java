package com.nextrisk.auth.service;

import com.nextrisk.auth.entity.RefreshToken;
import com.nextrisk.auth.entity.User;
import com.nextrisk.auth.repository.RefreshTokenRepository;
import com.nextrisk.config.SecurityProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Opaque, rotating refresh tokens.
 * <ul>
 *   <li>256-bit random value, only its SHA-256 hex digest is persisted.</li>
 *   <li>Every use rotates the token (old one revoked, new one issued in the same family).</li>
 *   <li>Presenting an already-rotated/revoked token is treated as theft: the whole family is revoked.</li>
 * </ul>
 */
@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    public record Issued(String rawToken, RefreshToken token) {
        @Override
        public String toString() {
            return "Issued[tokenId=" + token.getId() + "]";
        }
    }

    private final RefreshTokenRepository repository;
    private final SecurityProperties.Refresh props;

    public RefreshTokenService(RefreshTokenRepository repository, SecurityProperties properties) {
        this.repository = repository;
        this.props = properties.refresh();
    }

    @Transactional
    public Issued issue(User user, boolean rememberMe) {
        return create(user, rememberMe, UUID.randomUUID().toString());
    }

    /** Validates and rotates. The commit must survive reuse-detection, hence noRollbackFor. */
    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public Issued rotate(String rawToken) {
        RefreshToken current = lookup(rawToken);
        Instant now = Instant.now();

        if (current.isRevoked()) {
            repository.revokeFamily(current.getFamilyId(), now);
            log.warn("Refresh token reuse detected; family revoked (userId={})", current.getUser().getId());
            throw new InvalidRefreshTokenException("reused");
        }
        if (current.isExpired(now)) {
            current.revoke(now);
            throw new InvalidRefreshTokenException("expired");
        }
        if (!current.getUser().isEnabled()) {
            repository.revokeFamily(current.getFamilyId(), now);
            throw new InvalidRefreshTokenException("user disabled");
        }

        current.revoke(now);
        repository.saveAndFlush(current);
        return create(current.getUser(), current.isRememberMe(), current.getFamilyId());
    }

    /** Server-side logout: revokes the whole rotation family. Unknown tokens are ignored (idempotent). */
    @Transactional
    public boolean revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return false;
        }
        return repository.findByTokenHash(hash(rawToken))
                .map(t -> {
                    repository.revokeFamily(t.getFamilyId(), Instant.now());
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public int purgeExpired() {
        return repository.deleteExpiredBefore(Instant.now().minus(Duration.ofDays(1)));
    }

    private RefreshToken lookup(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidRefreshTokenException("missing");
        }
        return repository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new InvalidRefreshTokenException("unknown"));
    }

    private Issued create(User user, boolean rememberMe, String familyId) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Duration ttl = rememberMe ? Duration.ofDays(props.rememberTtlDays()) : Duration.ofHours(props.sessionTtlHours());
        RefreshToken saved = repository.save(new RefreshToken(user, hash(raw), familyId, rememberMe, Instant.now().plus(ttl)));
        return new Issued(raw, saved);
    }

    static String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
