package com.nextrisk.security;

import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import com.nextrisk.config.SecurityProperties;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/**
 * Issues short-lived HS256 access tokens. Claims are deliberately minimal:
 * sub (user id), iss, aud, iat, exp, jti and roles. No email, name or other PII.
 */
@Service
public class JwtService {

    public static final String ROLES_CLAIM = "roles";

    private final JwtEncoder encoder;
    private final SecurityProperties.Jwt props;

    public JwtService(JwtEncoder encoder, SecurityProperties properties) {
        this.encoder = encoder;
        this.props = properties.jwt();
    }

    public String issueAccessToken(User user) {
        Instant now = Instant.now();
        List<String> roles = user.getRoles().stream().map(Role::getName).sorted().toList();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(props.issuer())
                .audience(List.of(props.audience()))
                .subject(String.valueOf(user.getId()))
                .issuedAt(now)
                .expiresAt(now.plus(Duration.ofMinutes(props.accessTtlMinutes())))
                .id(UUID.randomUUID().toString())
                .claim(ROLES_CLAIM, roles)
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public long expiresInSeconds() {
        return Duration.ofMinutes(props.accessTtlMinutes()).toSeconds();
    }
}
