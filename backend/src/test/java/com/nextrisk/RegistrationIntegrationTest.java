package com.nextrisk;

import com.nextrisk.auth.entity.User;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RegistrationIntegrationTest extends AbstractIntegrationTest {

    private String body(String name, String email, String password) throws Exception {
        return json.writeValueAsString(Map.of("fullName", name, "email", email, "password", password));
    }

    @Test
    void registersUserWithBcryptHashDefaultRoleAndNormalizedEmail() throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content(body("  Jane   Doe ", "  Jane.Doe@Example.COM ", PASSWORD)))
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
    void rejectsInvalidFieldsWithFieldLevelErrors() throws Exception {
        mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content(body(" ", "not-an-email", "short")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors[?(@.field=='fullName')]").exists())
                .andExpect(jsonPath("$.fieldErrors[?(@.field=='email')]").exists())
                .andExpect(jsonPath("$.fieldErrors[?(@.field=='password')]").exists())
                .andExpect(jsonPath("$.trace").doesNotExist());
        assertThat(users.count()).isZero();
    }

    @Test
    void rejectsPasswordWithoutDigit() throws Exception {
        mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content(body("Jane Doe", "jane@example.com", "OnlyLettersHere")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[?(@.field=='password')]").exists());
    }

    @Test
    void rejectsDuplicateEmailCaseInsensitively() throws Exception {
        mvc.perform(post("/api/auth/register").contentType("application/json")
                .content(body("Jane Doe", "jane@example.com", PASSWORD))).andExpect(status().isCreated());
        mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content(body("Other Jane", " JANE@example.com", PASSWORD)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
        assertThat(users.count()).isEqualTo(1);
    }

    @Test
    void clientCannotEscalatePrivilegesByAddingRoles() throws Exception {
        String payload = json.writeValueAsString(Map.of(
                "fullName", "Mallory", "email", "mallory@example.com", "password", PASSWORD,
                "roles", List.of("ROLE_ADMIN")));
        mvc.perform(post("/api/auth/register").contentType("application/json").content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[0].field").value("roles"));
        assertThat(users.existsByEmail("mallory@example.com")).isFalse();
        assertThat(users.existsByRoles_Name("ROLE_ADMIN")).isFalse();

        for (String key : List.of("role", "authorities", "enabled", "admin")) {
            String variant = json.writeValueAsString(Map.of(
                    "fullName", "Mallory", "email", "mallory@example.com", "password", PASSWORD, key, "ROLE_ADMIN"));
            mvc.perform(post("/api/auth/register").contentType("application/json").content(variant))
                    .andExpect(status().isBadRequest());
        }
        assertThat(users.count()).isZero();
    }
}
