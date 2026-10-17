package com.nextrisk;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.nextrisk.auth.entity.Role;
import org.junit.jupiter.api.Test;

class RbacIntegrationTest extends AbstractIntegrationTest {

    @Test
    void anonymousIsUnauthorized() throws Exception {
        mvc.perform(get("/api/admin/ping")).andExpect(status().isUnauthorized());
    }

    @Test
    void nonAdminRolesAreForbidden() throws Exception {
        for (String role : new String[] {Role.GRC_ANALYST, Role.CISO, Role.SOC_ANALYST, Role.PENTESTER}) {
            String email = role.toLowerCase().replace("role_", "") + "@example.com";
            createUser(email, role);
            String token = accessToken(login(email, PASSWORD, false));
            mvc.perform(get("/api/admin/ping").header("Authorization", "Bearer " + token))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.status").value(403));
        }
    }

    @Test
    void adminIsAllowed() throws Exception {
        createUser("admin@example.com", Role.ADMIN);
        String token = accessToken(login("admin@example.com", PASSWORD, false));
        mvc.perform(get("/api/admin/ping").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"));
    }

    @Test
    void rolesClaimMapsToAuthoritiesWithoutDoublePrefix() throws Exception {
        createUser("admin@example.com", Role.ADMIN);
        String token = accessToken(login("admin@example.com", PASSWORD, false));
        String payload = new String(java.util.Base64.getUrlDecoder().decode(token.split("\\.")[1]));
        assertThat(payload).contains("\"roles\":[\"ROLE_ADMIN\"]").doesNotContain("ROLE_ROLE_")
                .doesNotContain("email").doesNotContain("password");
    }
}
