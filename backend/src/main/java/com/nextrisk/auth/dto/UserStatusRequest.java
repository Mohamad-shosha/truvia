package com.nextrisk.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Admin payload to enable or disable an account.")
public record UserStatusRequest(
        @Schema(example = "false") @NotNull(message = "enabled is required") Boolean enabled) {
}
