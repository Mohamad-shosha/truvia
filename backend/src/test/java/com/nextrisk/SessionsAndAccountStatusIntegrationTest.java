package com.nextrisk;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import jakarta.servlet.http.Cookie;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

class SessionsAndAccountStatusIntegrationTest extends AbstractIntegrationTest {

    private JsonNode listSessions(String token, Cookie cookie) throws Exception {
        var request = get("/api/auth/sessions").header("Authorization", bearer(token));
        if (cookie != null) {
            request.cookie(cookie);
        }
        MvcResult result = mvc.perform(request).andExpect(status().isOk()).andReturn();
        return json.readTree(result.getResponse().getContentAsString());
    }

    @Test
    void listsActiveSessionsAndFlagsTheCurrentOne() throws Exception {
        createUser("soc@example.com", Role.SOC_ANALYST);
        login("soc@example.com", PASSWORD, true);
        MvcResult current = login("soc@example.com", PASSWORD, false);

        JsonNode sessions = listSessions(accessToken(current), refreshCookie(current));

        assertThat(sessions).hasSize(2);
        assertThat(sessions.get(0).get("current").asBoolean()).isTrue();
        assertThat(sessions.get(0).get("rememberMe").asBoolean()).isFalse();
        assertThat(sessions.get(1).get("current").asBoolean()).isFalse();
        assertThat(sessions.get(1).get("rememberMe").asBoolean()).isTrue();
        assertThat(sessions.toString()).doesNotContain(refreshCookie(current).getValue());
    }

    @Test
    void rotationDoesNotCreateANewSession() throws Exception {
        createUser("soc@example.com", Role.SOC_ANALYST);
        MvcResult login = login("soc@example.com", PASSWORD, false);
        MvcResult rotated = mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .post("/api/auth/refresh").cookie(refreshCookie(login))
                        .header("X-Requested-With", "XMLHttpRequest"))
                .andExpect(status().isOk()).andReturn();

        JsonNode sessions = listSessions(accessToken(rotated), refreshCookie(rotated));
        assertThat(sessions).hasSize(1);
        assertThat(sessions.get(0).get("current").asBoolean()).isTrue();
    }

    @Test
    void userCanSignOutOneOfTheirSessions() throws Exception {
        createUser("soc@example.com", Role.SOC_ANALYST);
        Cookie laptop = refreshCookie(login("soc@example.com", PASSWORD, false));
        MvcResult phone = login("soc@example.com", PASSWORD, false);
        String token = accessToken(phone);

        String laptopId = listSessions(token, refreshCookie(phone)).get(1).get("id").asText();
        mvc.perform(delete("/api/auth/sessions/" + laptopId).header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());

        assertThat(refreshStatus(laptop)).isEqualTo(401);
        assertThat(refreshStatus(refreshCookie(phone))).isEqualTo(200);
    }

    @Test
    void cannotSignOutSomeoneElsesSession() throws Exception {
        createUser("victim@example.com", Role.CISO);
        createUser("soc@example.com", Role.SOC_ANALYST);
        MvcResult victim = login("victim@example.com", PASSWORD, false);
        String victimSession = listSessions(accessToken(victim), null).get(0).get("id").asText();
        String attacker = accessToken(login("soc@example.com", PASSWORD, false));

        mvc.perform(delete("/api/auth/sessions/" + victimSession).header("Authorization", bearer(attacker)))
                .andExpect(status().isNotFound());
        assertThat(refreshStatus(refreshCookie(victim))).isEqualTo(200);
    }

    @Test
    void signOutOthersKeepsTheCurrentSession() throws Exception {
        createUser("soc@example.com", Role.SOC_ANALYST);
        Cookie a = refreshCookie(login("soc@example.com", PASSWORD, false));
        Cookie b = refreshCookie(login("soc@example.com", PASSWORD, true));
        MvcResult current = login("soc@example.com", PASSWORD, false);

        mvc.perform(delete("/api/auth/sessions").header("Authorization", bearer(accessToken(current)))
                        .cookie(refreshCookie(current)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.revoked").value(2));

        assertThat(refreshStatus(a)).isEqualTo(401);
        assertThat(refreshStatus(b)).isEqualTo(401);
        assertThat(refreshStatus(refreshCookie(current))).isEqualTo(200);
    }

    @Test
    void adminCanDisableAndReEnableAnAccount() throws Exception {
        createUser("admin@example.com", Role.ADMIN);
        User employee = createUser("emp@example.com", Role.GRC_ANALYST);
        Cookie employeeSession = refreshCookie(login("emp@example.com", PASSWORD, false));
        String adminToken = accessToken(login("admin@example.com", PASSWORD, false));

        mvc.perform(patch("/api/admin/users/" + employee.getId() + "/status")
                        .header("Authorization", bearer(adminToken))
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of("enabled", false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));

        assertThat(refreshStatus(employeeSession)).isEqualTo(401);
        assertThat(login("emp@example.com", PASSWORD, false).getResponse().getStatus()).isEqualTo(401);

        mvc.perform(patch("/api/admin/users/" + employee.getId() + "/status")
                        .header("Authorization", bearer(adminToken))
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of("enabled", true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true));
        assertThat(login("emp@example.com", PASSWORD, false).getResponse().getStatus()).isEqualTo(200);
    }

    @Test
    void adminCannotDisableTheirOwnAccount() throws Exception {
        User admin = createUser("admin@example.com", Role.ADMIN);
        String adminToken = accessToken(login("admin@example.com", PASSWORD, false));

        mvc.perform(patch("/api/admin/users/" + admin.getId() + "/status")
                        .header("Authorization", bearer(adminToken))
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of("enabled", false))))
                .andExpect(status().isBadRequest());
        assertThat(users.findById(admin.getId()).orElseThrow().isEnabled()).isTrue();
    }

    @Test
    void accountStatusRequiresAdminAndAValidBody() throws Exception {
        createUser("admin@example.com", Role.ADMIN);
        User employee = createUser("emp@example.com", Role.GRC_ANALYST);
        createUser("ciso@example.com", Role.CISO);
        String cisoToken = accessToken(login("ciso@example.com", PASSWORD, false));
        String adminToken = accessToken(login("admin@example.com", PASSWORD, false));

        mvc.perform(patch("/api/admin/users/" + employee.getId() + "/status")
                        .header("Authorization", bearer(cisoToken))
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of("enabled", false))))
                .andExpect(status().isForbidden());

        mvc.perform(patch("/api/admin/users/" + employee.getId() + "/status")
                        .header("Authorization", bearer(adminToken))
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isBadRequest());

        mvc.perform(patch("/api/admin/users/999999/status")
                        .header("Authorization", bearer(adminToken))
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of("enabled", false))))
                .andExpect(status().isNotFound());
    }

    @Test
    void adminUserListIncludesSignInAndPasswordStatus() throws Exception {
        createUser("admin@example.com", Role.ADMIN);
        createUser("emp@example.com", Role.GRC_ANALYST);
        String adminToken = accessToken(login("admin@example.com", PASSWORD, false));

        mvc.perform(get("/api/admin/users").header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].lastLoginAt").isNotEmpty())
                .andExpect(jsonPath("$[1].lastLoginAt").isEmpty())
                .andExpect(jsonPath("$[1].usingInitialPassword").value(true));
    }
}
