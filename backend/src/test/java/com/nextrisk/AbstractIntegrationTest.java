package com.nextrisk;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import com.nextrisk.auth.repository.RoleRepository;
import com.nextrisk.auth.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(AbstractIntegrationTest.CleanMigrationConfig.class)
public abstract class AbstractIntegrationTest {

    public static final String PASSWORD = "Str0ng-Passphrase-1";

    /** Proves a FRESH database initializes: wipe the test schema, then run all migrations. */
    @TestConfiguration
    static class CleanMigrationConfig {
        @Bean
        FlywayMigrationStrategy cleanMigrate() {
            return flyway -> {
                flyway.clean();
                flyway.migrate();
            };
        }
    }

    @Autowired protected MockMvc mvc;
    @Autowired protected ObjectMapper json;
    @Autowired protected JdbcTemplate jdbc;
    @Autowired protected UserRepository users;
    @Autowired protected RoleRepository roles;
    @Autowired protected PasswordEncoder encoder;

    @BeforeEach
    void cleanTables() {
        jdbc.update("DELETE FROM refresh_tokens");
        jdbc.update("DELETE FROM user_roles");
        jdbc.update("DELETE FROM users");
    }

    protected User createUser(String email, String roleName, boolean enabled) {
        User user = new User("Test User", email, encoder.encode(PASSWORD));
        user.setEnabled(enabled);
        user.getRoles().add(roles.findByName(roleName).orElseThrow());
        return users.saveAndFlush(user);
    }

    protected User createUser(String email, String roleName) {
        return createUser(email, roleName, true);
    }

    protected MvcResult login(String email, String password, boolean remember) throws Exception {
        return mvc.perform(post("/api/auth/login").contentType("application/json")
                .content(json.writeValueAsString(Map.of("email", email, "password", password, "rememberMe", remember))))
                .andReturn();
    }

    protected String accessToken(MvcResult loginResult) throws Exception {
        JsonNode node = json.readTree(loginResult.getResponse().getContentAsString());
        return node.get("accessToken").asText();
    }

    protected Cookie refreshCookie(MvcResult result) {
        return result.getResponse().getCookie("nr_refresh");
    }

    protected static final String ADMIN = Role.ADMIN;
    protected static final String GRC = Role.GRC_ANALYST;
}
