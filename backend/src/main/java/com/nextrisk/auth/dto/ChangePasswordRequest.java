package com.nextrisk.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Payload for an authenticated user to change their own password.")
public record ChangePasswordRequest(
        @Schema(example = "Current-P@ssword1", description = "Current password")
        @NotBlank(message = "Current password is required")
        String currentPassword,

        @Schema(example = "N3w-secure-pass-99", description = "10-64 characters, at least one letter and one digit")
        @NotBlank(message = "New password is required")
        @Size(min = 10, max = 64, message = "New password must be between 10 and 64 characters")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "New password must contain at least one letter and one digit")
        String newPassword) {

    @Override
    public String toString() {
        return "ChangePasswordRequest[currentPassword=***, newPassword=***]";
    }
}

