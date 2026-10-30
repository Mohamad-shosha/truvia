package com.nextrisk.auth.dto;

import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;

@Schema(description = "Detailed user representation for admin management.")
public record AdminUserResponse(
        @Schema(example = "1") Long id,
        @Schema(example = "Jane Doe") String fullName,
        @Schema(example = "jane.doe@example.com") String email,
        @Schema(example = "true") boolean enabled,
        @Schema(example = "2026-10-30T14:00:00Z") Instant createdAt,
        @Schema(example = "[\"ROLE_GRC_ANALYST\"]") List<String> roles) {

    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.isEnabled(),
                user.getCreatedAt(),
                user.getRoles().stream().map(Role::getName).sorted().toList());
    }
}

