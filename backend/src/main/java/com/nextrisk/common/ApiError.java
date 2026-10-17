package com.nextrisk.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;

/** Uniform error envelope. Never contains stack traces or internal details. */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
@Schema(description = "Standard error response")
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldViolation> fieldErrors) {

    public record FieldViolation(String field, String message) {
    }
}
