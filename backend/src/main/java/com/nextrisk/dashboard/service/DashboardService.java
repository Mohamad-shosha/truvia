package com.nextrisk.dashboard.service;

import com.nextrisk.auth.dto.UserResponse;
import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import com.nextrisk.auth.repository.LoginEventRepository;
import com.nextrisk.auth.repository.RefreshTokenRepository;
import com.nextrisk.auth.repository.UserRepository;
import com.nextrisk.common.ApiException;
import com.nextrisk.dashboard.dto.DashboardDtos.AdminDashboardResponse;
import com.nextrisk.dashboard.dto.DashboardDtos.DailyCount;
import com.nextrisk.dashboard.dto.DashboardDtos.MyDashboardResponse;
import com.nextrisk.dashboard.dto.DashboardDtos.RoleCount;
import com.nextrisk.dashboard.dto.DashboardDtos.TeamResponse;
import com.nextrisk.dashboard.dto.DashboardDtos.UserSummary;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Read-only aggregations behind the dashboard. Everything is computed from live data on each request. */
@Service
public class DashboardService {

    /** Length of the sign-in activity chart on the admin dashboard. */
    public static final int ACTIVITY_DAYS = 14;

    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final LoginEventRepository loginEvents;
    private final Clock clock;

    public DashboardService(UserRepository users, RefreshTokenRepository refreshTokens,
            LoginEventRepository loginEvents) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.loginEvents = loginEvents;
        this.clock = Clock.systemUTC();
    }

    @Transactional(readOnly = true)
    public MyDashboardResponse myDashboard(long userId) {
        User user = users.findById(userId)
                .filter(User::isEnabled)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED,
                        "Authentication is required or the token is invalid"));
        List<Instant> recentLogins = loginEvents.findRecentLoginTimes(userId, PageRequest.of(0, 2));
        UserResponse profile = UserResponse.from(user);
        return new MyDashboardResponse(
                profile,
                user.getCreatedAt(),
                recentLogins.isEmpty() ? user.getLastLoginAt() : recentLogins.get(0),
                recentLogins.size() > 1 ? recentLogins.get(1) : null,
                user.getPasswordChangedAt(),
                user.isUsingAdminSetPassword(),
                refreshTokens.countActiveForUser(userId, clock.instant()),
                ModuleCatalog.forRoles(profile.roles()));
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse adminDashboard() {
        Instant now = clock.instant();
        long total = users.count();
        long active = users.countByEnabled(true);

        LocalDate today = LocalDate.ofInstant(now, ZoneOffset.UTC);
        LocalDate firstDay = today.minusDays(ACTIVITY_DAYS - 1L);
        List<DailyCount> daily = dailyCounts(
                loginEvents.findLoginTimesSince(firstDay.atStartOfDay(ZoneOffset.UTC).toInstant()), firstDay, today);
        long loginsInPeriod = daily.stream().mapToLong(DailyCount::count).sum();

        return new AdminDashboardResponse(
                total,
                active,
                total - active,
                perRole(users.countUsersPerRole()),
                refreshTokens.countActive(now),
                refreshTokens.countUsersWithActiveSession(now),
                ACTIVITY_DAYS,
                loginsInPeriod,
                daily,
                summaries(users.findTop5ByOrderByCreatedAtDesc()),
                users.countByEnabledTrueAndLastLoginAtIsNull(),
                summaries(users.findTop5ByEnabledTrueAndLastLoginAtIsNullOrderByCreatedAtDesc()),
                users.countByEnabledTrueAndPasswordChangedAtIsNull(),
                summaries(users.findTop5ByEnabledTrueAndPasswordChangedAtIsNullOrderByCreatedAtAsc()));
    }

    @Transactional(readOnly = true)
    public TeamResponse team() {
        return new TeamResponse(users.countByEnabled(true), perRole(users.countEnabledUsersPerRole()));
    }

    /** Every platform role in display order, zero-filled. */
    static List<RoleCount> perRole(List<Object[]> rows) {
        Map<String, Long> counts = new HashMap<>();
        for (Object[] row : rows) {
            counts.put((String) row[0], ((Number) row[1]).longValue());
        }
        return Role.ALL.stream().map(r -> new RoleCount(r, counts.getOrDefault(r, 0L))).toList();
    }

    /** Buckets timestamps into UTC days from {@code first} to {@code last} inclusive, zero-filled. */
    static List<DailyCount> dailyCounts(List<Instant> times, LocalDate first, LocalDate last) {
        Map<LocalDate, Long> counts = new HashMap<>();
        for (Instant t : times) {
            counts.merge(LocalDate.ofInstant(t, ZoneOffset.UTC), 1L, Long::sum);
        }
        List<DailyCount> out = new ArrayList<>();
        for (LocalDate d = first; !d.isAfter(last); d = d.plusDays(1)) {
            out.add(new DailyCount(d, counts.getOrDefault(d, 0L)));
        }
        return out;
    }

    private static List<UserSummary> summaries(List<User> list) {
        return list.stream().map(UserSummary::from).toList();
    }
}
