package com.nextrisk.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

/**
 * Typed, validated security configuration. The application fails fast at startup when
 * required values (notably the JWT signing secret) are missing or too weak.
 */
@Validated
@ConfigurationProperties(prefix = "nextrisk.security")
public record SecurityProperties(
        @DefaultValue("12") @Min(4) int bcryptStrength,
        @Valid Jwt jwt,
        @Valid Refresh refresh,
        @Valid Cors cors,
        @DefaultValue BootstrapAdmin bootstrapAdmin) {

    public record Jwt(
            @NotBlank @Size(min = 32, message = "JWT_SECRET must be at least 32 characters") String secret,
            @NotBlank String issuer,
            @NotBlank String audience,
            @Min(1) long accessTtlMinutes) {

        @Override
        public String toString() {
            return "Jwt[issuer=" + issuer + ", audience=" + audience + ", accessTtlMinutes=" + accessTtlMinutes + "]";
        }
    }

    public record Refresh(
            @Min(1) long rememberTtlDays,
            @Min(1) long sessionTtlHours,
            boolean cookieSecure,
            @NotBlank String cookieName,
            @NotBlank String cookiePath) {
    }

    public record Cors(@NotEmpty List<String> allowedOrigins) {

        @AssertTrue(message = "CORS origins must be explicit; wildcards are not allowed")
        public boolean isExplicit() {
            return allowedOrigins == null || allowedOrigins.stream().noneMatch(o -> o.contains("*"));
        }
    }

    public record BootstrapAdmin(String email, String password, String fullName) {

        public boolean isConfigured() {
            return email != null && !email.isBlank() && password != null && !password.isBlank();
        }

        @Override
        public String toString() {
            return "BootstrapAdmin[email=" + email + ", password=***]";
        }
    }
}
