package com.nextrisk.auth.service;

import com.nextrisk.config.SecurityProperties;
import java.time.Duration;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Builds the refresh-token cookie: HttpOnly, SameSite=Strict, path-scoped to /api/auth,
 * Secure per configuration. Without "remember me" it is a session cookie (no Max-Age).
 */
@Component
public class RefreshCookieFactory {

    private final SecurityProperties.Refresh props;

    public RefreshCookieFactory(SecurityProperties properties) {
        this.props = properties.refresh();
    }

    public ResponseCookie create(String rawToken, boolean rememberMe) {
        ResponseCookie.ResponseCookieBuilder builder = base(rawToken);
        if (rememberMe) {
            builder.maxAge(Duration.ofDays(props.rememberTtlDays()));
        }
        return builder.build();
    }

    public ResponseCookie clear() {
        return base("").maxAge(Duration.ZERO).build();
    }

    public String cookieName() {
        return props.cookieName();
    }

    private ResponseCookie.ResponseCookieBuilder base(String value) {
        return ResponseCookie.from(props.cookieName(), value)
                .httpOnly(true)
                .secure(props.cookieSecure())
                .sameSite("Strict")
                .path(props.cookiePath());
    }
}
