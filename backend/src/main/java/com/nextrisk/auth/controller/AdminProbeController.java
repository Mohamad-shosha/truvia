package com.nextrisk.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Minimal RBAC probe: proves method-level role enforcement end to end (backend decides, not the UI).
 * It carries no business functionality and can be removed once real admin-only endpoints exist.
 */
@RestController
@RequestMapping("/api/admin")
@Tag(name = "RBAC probe")
public class AdminProbeController {

    @GetMapping("/ping")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "ROLE_ADMIN-only probe", security = @SecurityRequirement(name = "bearerAuth"))
    public Map<String, String> ping() {
        return Map.of("status", "ok", "requiredRole", "ROLE_ADMIN");
    }
}
