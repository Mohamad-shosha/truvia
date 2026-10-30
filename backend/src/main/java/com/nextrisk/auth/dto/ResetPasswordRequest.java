package com.nextrisk.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Admin payload to reset a user's password.")
public record ResetPasswordRequest(
        @Schema(example = "N3w-secure-pass-99", description = "10-64 characters, at least one letter and one digit")
        @NotBlank(message = "New password is required")
        @Size(min = 10, max = 64, message = "Password must be between 10 and 64 characters")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "Password must contain at least one letter and one digit")
        String newPassword) {

    @Override
    public String toString() {
        return "ResetPasswordRequest[password=***]";
    }
}

