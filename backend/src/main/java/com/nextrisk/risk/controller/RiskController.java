package com.nextrisk.risk.controller;

import com.nextrisk.activity.ActivityService;
import com.nextrisk.activity.ActivityService.ActivityResponse;
import com.nextrisk.risk.dto.RiskDtos.RiskOverview;
import com.nextrisk.risk.dto.RiskDtos.RiskRequest;
import com.nextrisk.risk.dto.RiskDtos.RiskResponse;
import com.nextrisk.risk.service.RiskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Risk register. Read: CISO, GRC, SOC and Admin. Write: CISO and GRC (the risk owners of the platform).
 */
@RestController
@Tag(name = "Risk Register")
@SecurityRequirement(name = "bearerAuth")
public class RiskController {

    static final String READ = "hasAnyRole('ADMIN', 'CISO', 'GRC_ANALYST', 'SOC_ANALYST')";
    static final String WRITE = "hasAnyRole('CISO', 'GRC_ANALYST')";

    private final RiskService risks;
    private final ActivityService activity;

    public RiskController(RiskService risks, ActivityService activity) {
        this.risks = risks;
        this.activity = activity;
    }

    @GetMapping("/api/risks")
    @PreAuthorize(READ)
    @Operation(summary = "List all risks", description = "CISO, GRC, SOC, Admin.")
    public List<RiskResponse> list() {
        return risks.list();
    }

    @GetMapping("/api/risks/{id}")
    @PreAuthorize(READ)
    @Operation(summary = "Get one risk")
    @ApiResponse(responseCode = "404", description = "Not found")
    public RiskResponse get(@PathVariable long id) {
        return risks.get(id);
    }

    @PostMapping("/api/risks")
    @PreAuthorize(WRITE)
    @Operation(summary = "Create a risk", description = "CISO, GRC. A code like RSK-007 is assigned.")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "400", description = "Validation failed (e.g. residual higher than inherent)")
    public ResponseEntity<RiskResponse> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody RiskRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(risks.create(jwt.getSubject(), req));
    }

    @PutMapping("/api/risks/{id}")
    @PreAuthorize(WRITE)
    @Operation(summary = "Update a risk", description = "CISO, GRC.")
    public RiskResponse update(@AuthenticationPrincipal Jwt jwt, @PathVariable long id,
            @Valid @RequestBody RiskRequest req) {
        return risks.update(jwt.getSubject(), id, req);
    }

    @DeleteMapping("/api/risks/{id}")
    @PreAuthorize(WRITE)
    @Operation(summary = "Delete a risk", description = "CISO, GRC.")
    @ApiResponse(responseCode = "204", description = "Deleted")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable long id) {
        risks.delete(jwt.getSubject(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/risks/overview")
    @PreAuthorize(READ)
    @Operation(summary = "Risk posture for the dashboard",
            description = "KPIs with the value from `days` ago, score trend, 5x5 heat map, status and level "
                    + "breakdowns, top five risks. days = 7, 30 or 90.")
    public RiskOverview overview(@RequestParam(defaultValue = "30") int days) {
        return risks.overview(days);
    }

    @GetMapping(value = "/api/risks/export", produces = "text/csv")
    @PreAuthorize(READ)
    @Operation(summary = "Export the risk register as CSV")
    public ResponseEntity<byte[]> export() {
        byte[] body = ("﻿" + risks.exportCsv()).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"truvia-risk-register-" + LocalDate.now(ZoneOffset.UTC) + ".csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(body);
    }

    @GetMapping("/api/activity")
    @PreAuthorize(READ)
    @Operation(summary = "Recent activity", description = "Newest first; limit 1-50.")
    public List<ActivityResponse> recentActivity(@RequestParam(defaultValue = "8") int limit) {
        return activity.recent(limit);
    }
}
