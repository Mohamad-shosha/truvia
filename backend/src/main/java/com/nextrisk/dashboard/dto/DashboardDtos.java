package com.nextrisk.dashboard.dto;

import com.nextrisk.auth.dto.UserResponse;
import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Response shapes of the dashboard API. Grouped in one file because they are small and only used together. */
public final class DashboardDtos {

    private DashboardDtos() {
    }

    @Schema(description = "A platform module and whether it can be used yet.")
    public record ModuleStatus(
            @Schema(example = "risks") String key,
            @Schema(example = "Risk Register & Live Scoring") String title,
            @Schema(example = "Central risk register with dynamic 0-100 scoring.") String description,
            @Schema(example = "PLANNED", allowableValues = {"AVAILABLE", "PLANNED"}) String status,
            @Schema(example = "/admin", description = "Frontend route when AVAILABLE, otherwise null") String path,
            @Schema(example = "Phase 4", description = "Roadmap phase when PLANNED, otherwise null") String plannedFor) {
    }

    @Schema(description = "The current user's personal workspace.")
    public record MyDashboardResponse(
            UserResponse user,
            Instant memberSince,
            @Schema(description = "This sign-in (most recent)") Instant lastLoginAt,
            @Schema(description = "The sign-in before this one; null if none") Instant previousLoginAt,
            @Schema(description = "When the user last chose their own password; null if never") Instant passwordChangedAt,
            @Schema(description = "True while the account still uses a password set by an administrator")
            boolean mustChangePassword,
            long activeSessions,
            List<ModuleStatus> modules) {
    }

    public record RoleCount(@Schema(example = "ROLE_SOC_ANALYST") String role, long count) {
    }

    public record DailyCount(@Schema(example = "2026-11-22") LocalDate date, long count) {
    }

    @Schema(description = "Compact user reference for dashboard lists.")
    public record UserSummary(Long id, String fullName, String email, List<String> roles, Instant createdAt,
            Instant lastLoginAt) {

        public static UserSummary from(User u) {
            return new UserSummary(u.getId(), u.getFullName(), u.getEmail(),
                    u.getRoles().stream().map(Role::getName).sorted().toList(), u.getCreatedAt(), u.getLastLoginAt());
        }
    }

    @Schema(description = "Platform overview for administrators.")
    public record AdminDashboardResponse(
            long totalUsers,
            long activeUsers,
            long disabledUsers,
            @Schema(description = "Every role, including roles nobody holds (count 0)") List<RoleCount> usersByRole,
            @Schema(description = "Sessions that are signed in right now") long activeSessions,
            @Schema(description = "Distinct users with at least one active session") long usersWithActiveSession,
            @Schema(example = "14") int activityDays,
            long loginsInPeriod,
            @Schema(description = "One entry per UTC day, oldest first, zero-filled") List<DailyCount> dailyLogins,
            @Schema(description = "Five most recently created accounts") List<UserSummary> recentUsers,
            long neverSignedInCount,
            @Schema(description = "Up to five enabled accounts that never signed in") List<UserSummary> neverSignedIn,
            long initialPasswordCount,
            @Schema(description = "Up to five enabled accounts still on an administrator-set password, oldest first")
            List<UserSummary> initialPassword) {
    }

    @Schema(description = "Security team composition (enabled accounts only).")
    public record TeamResponse(long activeMembers, List<RoleCount> byRole) {
    }
}
