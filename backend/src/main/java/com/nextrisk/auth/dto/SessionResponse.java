package com.nextrisk.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "One active sign-in session (a refresh-token rotation family) of the current user.")
public record SessionResponse(
        @Schema(description = "Opaque session identifier, used to sign the session out") String id,
        @Schema(description = "When the user signed in") Instant startedAt,
        @Schema(description = "Last time the session refreshed its access token") Instant lastActiveAt,
        @Schema(description = "When the session expires unless refreshed") Instant expiresAt,
        boolean rememberMe,
        @Schema(description = "True for the session making this request") boolean current) {
}
