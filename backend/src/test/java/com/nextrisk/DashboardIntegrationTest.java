package com.nextrisk;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import jakarta.servlet.http.Cookie;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

class DashboardIntegrationTest extends AbstractIntegrationTest {

    @Test
    void anonymousIsUnauthorized() throws Exception {
        mvc.perform(get("/api/dashboard/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/dashboard/team")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/dashboard")).andExpect(status().isUnauthorized());
    }

    @Test
    void loginRecordsLastLoginAndHistory() throws Exception {
        User user = createUser("grc@example.com", Role.GRC_ANALYST);
        assertThat(user.getLastLoginAt()).isNull();

        login("grc@example.com", PASSWORD, false);

        assertThat(users.findById(user.getId()).orElseThrow().getLastLoginAt()).isNotNull();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM login_events WHERE user_id = ?", Long.class, user.getId()))
                .isEqualTo(1L);
    }

    @Test
    void failedLoginIsNotRecorded() throws Exception {
        User user = createUser("grc@example.com", Role.GRC_ANALYST);
        login("grc@example.com", "Wrong-password-1", false);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM login_events", Long.class)).isZero();
        assertThat(users.findById(user.getId()).orElseThrow().getLastLoginAt()).isNull();
    }

    @Test
    void myDashboardShowsSignInHistorySessionsAndRoleModules() throws Exception {
        createUser("grc@example.com", Role.GRC_ANALYST);
        login("grc@example.com", PASSWORD, false);
        String token = accessToken(login("grc@example.com", PASSWORD, true));

        mvc.perform(get("/api/dashboard/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value("grc@example.com"))
                .andExpect(jsonPath("$.lastLoginAt").isNotEmpty())
                .andExpect(jsonPath("$.previousLoginAt").isNotEmpty())
                .andExpect(jsonPath("$.mustChangePassword").value(true))
                .andExpect(jsonPath("$.activeSessions").value(2))
                .andExpect(jsonPath("$.modules[*].key", hasItem("risks")))
                .andExpect(jsonPath("$.modules[*].key", hasItem("compliance")))
                .andExpect(jsonPath("$.modules[*].key", not(hasItem("users"))))
                .andExpect(jsonPath("$.modules[*].key", not(hasItem("reports"))))
                .andExpect(jsonPath("$.modules[0].key").value("risks"))
                .andExpect(jsonPath("$.modules[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$.modules[1].status").value("PLANNED"))
                .andExpect(jsonPath("$.modules[1].plannedFor").isNotEmpty());
    }

    @Test
    void adminWorkspaceListsUserAdministrationFirstAsAvailable() throws Exception {
        createUser("admin@example.com", Role.ADMIN);
        String token = accessToken(login("admin@example.com", PASSWORD, false));

        mvc.perform(get("/api/dashboard/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.previousLoginAt").isEmpty())
                .andExpect(jsonPath("$.modules[0].key").value("users"))
                .andExpect(jsonPath("$.modules[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$.modules[0].path").value("/admin"));
    }

    @Test
    void adminDashboardIsAdminOnly() throws Exception {
        for (String role : new String[] {Role.CISO, Role.GRC_ANALYST, Role.SOC_ANALYST, Role.PENTESTER}) {
            String email = role.toLowerCase().replace("role_", "") + "@example.com";
            createUser(email, role);
            String token = accessToken(login(email, PASSWORD, false));
            mvc.perform(get("/api/admin/dashboard").header("Authorization", bearer(token)))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    void adminDashboardAggregatesAccountsSessionsAndActivity() throws Exception {
        createUser("admin@example.com", Role.ADMIN);
        createUser("soc@example.com", Role.SOC_ANALYST);
        createUser("idle@example.com", Role.PENTESTER);
        createUser("gone@example.com", Role.GRC_ANALYST, false);
        login("soc@example.com", PASSWORD, false);
        String token = accessToken(login("admin@example.com", PASSWORD, false));

        MvcResult result = mvc.perform(get("/api/admin/dashboard").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(4))
                .andExpect(jsonPath("$.activeUsers").value(3))
                .andExpect(jsonPath("$.disabledUsers").value(1))
                .andExpect(jsonPath("$.usersByRole.length()").value(5))
                .andExpect(jsonPath("$.usersByRole[0].role").value("ROLE_ADMIN"))
                .andExpect(jsonPath("$.usersByRole[0].count").value(1))
                .andExpect(jsonPath("$.activeSessions").value(2))
                .andExpect(jsonPath("$.usersWithActiveSession").value(2))
                .andExpect(jsonPath("$.activityDays").value(14))
                .andExpect(jsonPath("$.dailyLogins.length()").value(14))
                .andExpect(jsonPath("$.loginsInPeriod").value(2))
                .andExpect(jsonPath("$.recentUsers.length()").value(4))
                .andExpect(jsonPath("$.neverSignedInCount").value(1))
                .andExpect(jsonPath("$.neverSignedIn[0].email").value("idle@example.com"))
                .andExpect(jsonPath("$.initialPasswordCount").value(3))
                .andReturn();

        JsonNode daily = json.readTree(result.getResponse().getContentAsString()).get("dailyLogins");
        JsonNode today = daily.get(13);
        assertThat(today.get("date").asText()).isEqualTo(LocalDate.now(ZoneOffset.UTC).toString());
        assertThat(today.get("count").asLong()).isEqualTo(2);
        assertThat(result.getResponse().getContentAsString()).doesNotContain("passwordHash").doesNotContain("$2");
    }

    @Test
    void teamIsForCisoAndAdminAndCountsOnlyEnabledAccounts() throws Exception {
        createUser("ciso@example.com", Role.CISO);
        createUser("soc1@example.com", Role.SOC_ANALYST);
        createUser("soc2@example.com", Role.SOC_ANALYST);
        createUser("soc3@example.com", Role.SOC_ANALYST, false);
        createUser("grc@example.com", Role.GRC_ANALYST);

        String cisoToken = accessToken(login("ciso@example.com", PASSWORD, false));
        mvc.perform(get("/api/dashboard/team").header("Authorization", bearer(cisoToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeMembers").value(4))
                .andExpect(jsonPath("$.byRole[3].role").value("ROLE_SOC_ANALYST"))
                .andExpect(jsonPath("$.byRole[3].count").value(2));

        String grcToken = accessToken(login("grc@example.com", PASSWORD, false));
        mvc.perform(get("/api/dashboard/team").header("Authorization", bearer(grcToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    void changingOwnPasswordClearsReminderAndSignsOutOtherSessionsOnly() throws Exception {
        createUser("grc@example.com", Role.GRC_ANALYST);
        Cookie otherDevice = refreshCookie(login("grc@example.com", PASSWORD, false));
        MvcResult thisDevice = login("grc@example.com", PASSWORD, false);
        String token = accessToken(thisDevice);

        mvc.perform(post("/api/auth/change-password")
                        .header("Authorization", bearer(token))
                        .cookie(refreshCookie(thisDevice))
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of(
                                "currentPassword", PASSWORD, "newPassword", "Brand-new-pass-42"))))
                .andExpect(status().isOk());

        assertThat(refreshStatus(otherDevice)).isEqualTo(401);
        assertThat(refreshStatus(refreshCookie(thisDevice))).isEqualTo(200);

        String fresh = accessToken(login("grc@example.com", "Brand-new-pass-42", false));
        mvc.perform(get("/api/dashboard/me").header("Authorization", bearer(fresh)))
                .andExpect(jsonPath("$.mustChangePassword").value(false))
                .andExpect(jsonPath("$.passwordChangedAt").isNotEmpty());
    }

    @Test
    void adminResetBringsBackTheChangePasswordReminder() throws Exception {
        createUser("admin@example.com", Role.ADMIN);
        User employee = createUser("emp@example.com", Role.GRC_ANALYST);
        jdbc.update("UPDATE users SET password_changed_at = CURRENT_TIMESTAMP(6) WHERE id = ?", employee.getId());
        String adminToken = accessToken(login("admin@example.com", PASSWORD, false));

        mvc.perform(post("/api/admin/users/" + employee.getId() + "/reset-password")
                        .header("Authorization", bearer(adminToken))
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of("newPassword", "Temp-pass-1234"))))
                .andExpect(status().isOk());

        assertThat(users.findById(employee.getId()).orElseThrow().getPasswordChangedAt()).isNull();
    }
}
