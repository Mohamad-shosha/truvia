package com.nextrisk;

import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RegistrationIntegrationTest extends AbstractIntegrationTest {

    private String adminCreateBody(String name, String email, String password, String role) throws Exception {
        return json.writeValueAsString(Map.of(
                "fullName", name,
                "email", email,
                "password", password,
                "role", role
        ));
    }

    @Test
    void publicRegistrationIsDisabled() throws Exception {
        mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content(json.writeValueAsString(Map.of("email", "test@test.com", "password", PASSWORD, "fullName", "Test User"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminCanCreateUserAndAssignRole() throws Exception {
        User admin = createUser("admin@company.com", ADMIN);
        String adminToken = accessToken(login("admin@company.com", PASSWORD, false));

        MvcResult result = mvc.perform(post("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType("application/json")
                        .content(adminCreateBody("  Jane   Doe ", "  Jane.Doe@Example.COM ", PASSWORD, Role.GRC_ANALYST)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("jane.doe@example.com"))
                .andExpect(jsonPath("$.fullName").value("Jane Doe"))
                .andExpect(jsonPath("$.roles[0]").value("ROLE_GRC_ANALYST"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andReturn();
        assertThat(result.getResponse().getContentAsString()).doesNotContain("$2");

        User stored = users.findByEmail("jane.doe@example.com").orElseThrow();
        assertThat(stored.getPasswordHash()).startsWith("$2").isNotEqualTo(PASSWORD);
        assertThat(BCrypt.checkpw(PASSWORD, stored.getPasswordHash())).isTrue();
        assertThat(stored.isEnabled()).isTrue();
    }

    @Test
    void adminCanResetUserPassword() throws Exception {
        User admin = createUser("admin@company.com", ADMIN);
        String adminToken = accessToken(login("admin@company.com", PASSWORD, false));
        User employee = createUser("emp@company.com", GRC);

        String newPassword = "New-Secure-Pass-123";
        mvc.perform(post("/api/admin/users/" + employee.getId() + "/reset-password")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of("newPassword", newPassword))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password reset successfully"));

        User updated = users.findById(employee.getId()).orElseThrow();
        assertThat(BCrypt.checkpw(newPassword, updated.getPasswordHash())).isTrue();
    }

    @Test
    void userCanChangeOwnPassword() throws Exception {
        User user = createUser("user@company.com", GRC);
        String token = accessToken(login("user@company.com", PASSWORD, false));

        String newSecretPassword = "My-Own-Secret-Pass-456";
        mvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(json.writeValueAsString(Map.of(
                                "currentPassword", PASSWORD,
                                "newPassword", newSecretPassword
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password changed successfully"));

        User updated = users.findById(user.getId()).orElseThrow();
        assertThat(BCrypt.checkpw(newSecretPassword, updated.getPasswordHash())).isTrue();
    }
}
