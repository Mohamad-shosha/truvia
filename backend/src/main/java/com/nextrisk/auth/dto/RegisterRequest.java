package com.nextrisk.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Public self-registration payload. Roles cannot be supplied; unknown fields are rejected.")
public record RegisterRequest(
        @Schema(example = "Jane Doe")
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
        String fullName,

        @Schema(example = "jane.doe@example.com")
        @NotBlank(message = "Email is required")
        @Size(max = 254, message = "Email is too long")
        @Email(message = "Email must be a valid address")
        @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", message = "Email must be a valid address")
        String email,

        @Schema(example = "S3cure-passphrase-42", description = "10-64 characters, at least one letter and one digit")
        @NotBlank(message = "Password is required")
        @Size(min = 10, max = 64, message = "Password must be between 10 and 64 characters")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$", message = "Password must contain at least one letter and one digit")
        String password) {

    public RegisterRequest {
        fullName = fullName != null ? fullName.trim() : null;
        email = email != null ? email.trim() : null;
    }

    @Override
    public String toString() {
        return "RegisterRequest[email=" + email + ", password=***]";
    }
}
