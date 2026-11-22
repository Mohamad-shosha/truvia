package com.nextrisk.dashboard.controller;

import com.nextrisk.auth.service.AuthService;
import com.nextrisk.dashboard.dto.DashboardDtos.AdminDashboardResponse;
import com.nextrisk.dashboard.dto.DashboardDtos.MyDashboardResponse;
import com.nextrisk.dashboard.dto.DashboardDtos.TeamResponse;
import com.nextrisk.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Dashboard")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboard;

    public DashboardController(DashboardService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping("/api/dashboard/me")
    @Operation(summary = "My workspace", description = "Any signed-in user. Sign-in history, password status, "
            + "active session count and the modules relevant to the user's roles.")
    @ApiResponse(responseCode = "200", description = "Personal dashboard")
    public MyDashboardResponse me(@AuthenticationPrincipal Jwt jwt) {
        return dashboard.myDashboard(AuthService.userIdFrom(jwt.getSubject()));
    }

    @GetMapping("/api/dashboard/team")
    @PreAuthorize("hasAnyRole('CISO', 'ADMIN')")
    @Operation(summary = "Security team composition", description = "ROLE_CISO or ROLE_ADMIN. Enabled accounts per role.")
    @ApiResponse(responseCode = "200", description = "Team composition")
    @ApiResponse(responseCode = "403", description = "Requires ROLE_CISO or ROLE_ADMIN")
    public TeamResponse team() {
        return dashboard.team();
    }

    @GetMapping("/api/admin/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Platform overview", description = "ROLE_ADMIN only. Accounts, roles, live sessions, "
            + DashboardService.ACTIVITY_DAYS + "-day sign-in activity and accounts needing attention.")
    @ApiResponse(responseCode = "200", description = "Admin dashboard")
    @ApiResponse(responseCode = "403", description = "Requires ROLE_ADMIN")
    public AdminDashboardResponse admin() {
        return dashboard.adminDashboard();
    }
}
