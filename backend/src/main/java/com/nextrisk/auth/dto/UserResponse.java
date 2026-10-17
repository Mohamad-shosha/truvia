package com.nextrisk.auth.dto;

import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Safe public view of a user. Never includes password hash or tokens.")
public record UserResponse(
        @Schema(example = "1") Long id,
        @Schema(example = "Jane Doe") String fullName,
        @Schema(example = "jane.doe@example.com") String email,
        @Schema(example = "[\"ROLE_GRC_ANALYST\"]") List<String> roles) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(),
                user.getRoles().stream().map(Role::getName).sorted().toList());
    }
}
