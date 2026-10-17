package com.nextrisk.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Returned by login and refresh. The refresh token is NOT in the body: it is set as an HttpOnly cookie.")
public record AuthResponse(
        String accessToken,
        @Schema(example = "Bearer") String tokenType,
        @Schema(description = "Access token lifetime in seconds", example = "900") long expiresIn,
        UserResponse user) {

    @Override
    public String toString() {
        return "AuthResponse[user=" + user + "]";
    }
}
