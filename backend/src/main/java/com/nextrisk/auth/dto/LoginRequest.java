package com.nextrisk.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Login payload")
public record LoginRequest(
        @Schema(example = "jane.doe@example.com")
        @NotBlank(message = "Email is required")
        @Size(max = 254, message = "Email is too long")
        String email,

        @Schema(example = "S3cure-passphrase-42")
        @NotBlank(message = "Password is required")
        @Size(max = 128, message = "Password is too long")
        String password,

        @Schema(description = "true: refresh cookie persists for the configured remember period; false: session cookie")
        boolean rememberMe) {

    public LoginRequest {
        email = email != null ? email.trim() : null;
    }

    @Override
    public String toString() {
        return "LoginRequest[email=" + email + ", password=***]";
    }
}
