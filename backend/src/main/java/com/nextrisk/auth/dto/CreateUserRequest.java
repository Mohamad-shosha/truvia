package com.nextrisk.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Admin payload to create a new user account with a specific role.")
public record CreateUserRequest(
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
        String password,

        @Schema(example = "ROLE_GRC_ANALYST", description = "Role to assign. Must be one of: ROLE_ADMIN, ROLE_CISO, ROLE_GRC_ANALYST, ROLE_SOC_ANALYST, ROLE_PENTESTER")
        @NotBlank(message = "Role is required")
        String role) {

    public CreateUserRequest {
        fullName = fullName != null ? fullName.trim() : null;
        email = email != null ? email.trim() : null;
    }

    @Override
    public String toString() {
        return "CreateUserRequest[email=" + email + ", role=" + role + ", password=***]";
    }
}

