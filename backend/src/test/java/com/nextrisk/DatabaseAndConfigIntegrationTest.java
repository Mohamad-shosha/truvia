package com.nextrisk;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.service.AdminBootstrap;
import com.nextrisk.config.SecurityProperties;
import jakarta.validation.Validation;
import java.util.List;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.dao.DataIntegrityViolationException;

class DatabaseAndConfigIntegrationTest extends AbstractIntegrationTest {

    @Autowired Flyway flyway;

    @Test
    void allRequiredRolesAreSeededExactlyOnce() {
        List<String> names = jdbc.queryForList("SELECT name FROM roles ORDER BY name", String.class);
        assertThat(names).containsExactlyInAnyOrder(Role.ADMIN, Role.CISO, Role.GRC_ANALYST, Role.SOC_ANALYST, Role.PENTESTER);
    }

    @Test
    void rerunningMigrationsIsANoOpAndDoesNotDuplicateSeeds() {
        var result = flyway.migrate();
        assertThat(result.migrationsExecuted).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM roles", Integer.class)).isEqualTo(5);
        assertThat(flyway.info().applied()).hasSize(3);
    }

    @Test
    void noUsersAreSeededByMigrations() {
        // cleanTables() ran; a fresh migration never inserts users, and the schema holds no default admin
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM users", Integer.class)).isZero();
    }

    @Test
    void duplicateAndNonNormalizedEmailsAreRejectedByTheDatabase() {
        jdbc.update("INSERT INTO users (full_name, email, password_hash) VALUES ('A', 'a@example.com', 'x')");
        assertThatThrownBy(() -> jdbc.update("INSERT INTO users (full_name, email, password_hash) VALUES ('B', 'a@example.com', 'x')"))
                .isInstanceOf(org.springframework.dao.DataAccessException.class);
        assertThatThrownBy(() -> jdbc.update("INSERT INTO users (full_name, email, password_hash) VALUES ('B', 'A@Example.com', 'x')"))
                .isInstanceOf(org.springframework.dao.DataAccessException.class);
        assertThatThrownBy(() -> jdbc.update("INSERT INTO users (full_name, email, password_hash) VALUES ('B', 'C@Example.com', 'x')"))
                .isInstanceOf(org.springframework.dao.DataAccessException.class); // CHECK: must be lower-case
    }

    @Test
    void foreignKeysAndUniqueRoleConstraintsHold() {
        assertThatThrownBy(() -> jdbc.update("INSERT INTO user_roles (user_id, role_id) VALUES (999999, 1)"))
                .isInstanceOf(org.springframework.dao.DataAccessException.class);
        assertThatThrownBy(() -> jdbc.update("INSERT INTO roles (name) VALUES ('ROLE_ADMIN')"))
                .isInstanceOf(org.springframework.dao.DataAccessException.class);
        assertThatThrownBy(() -> jdbc.update("INSERT INTO roles (name) VALUES ('NOT_PREFIXED')"))
                .isInstanceOf(org.springframework.dao.DataAccessException.class);
        assertThatThrownBy(() -> jdbc.update("INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at) "
                + "VALUES (999999, REPEAT('a',64), UUID(), NOW())")).isInstanceOf(org.springframework.dao.DataAccessException.class);
    }

    @Test
    void deletingUserCascadesToRolesAndRefreshTokens() throws Exception {
        createUser("jane@example.com", GRC);
        login("jane@example.com", PASSWORD, false);
        jdbc.update("DELETE FROM users");
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM user_roles", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM refresh_tokens", Integer.class)).isZero();
    }

    @Test
    void bootstrapAdminCreatesExactlyOneAdminAndIsIdempotent() throws Exception {
        var cfg = new SecurityProperties.BootstrapAdmin("Boss@Example.com", "A-very-long-password-1", "Boss");
        var props = new SecurityProperties(4, null, null, null, cfg);
        var bootstrap = new AdminBootstrap(props, users, roles, encoder);

        bootstrap.run(new DefaultApplicationArguments());
        bootstrap.run(new DefaultApplicationArguments());

        assertThat(users.count()).isEqualTo(1);
        var admin = users.findByEmail("boss@example.com").orElseThrow();
        assertThat(admin.getRoles()).extracting(Role::getName).containsExactly(Role.ADMIN);
        assertThat(encoder.matches("A-very-long-password-1", admin.getPasswordHash())).isTrue();
    }

    @Test
    void bootstrapAdminDoesNothingWhenNotConfiguredOrAdminExists() throws Exception {
        var none = new AdminBootstrap(new SecurityProperties(4, null, null, null,
                new SecurityProperties.BootstrapAdmin("", "", null)), users, roles, encoder);
        none.run(new DefaultApplicationArguments());
        assertThat(users.count()).isZero();

        createUser("existing-admin@example.com", Role.ADMIN);
        var cfg = new SecurityProperties.BootstrapAdmin("second@example.com", "A-very-long-password-1", "Second");
        new AdminBootstrap(new SecurityProperties(4, null, null, null, cfg), users, roles, encoder)
                .run(new DefaultApplicationArguments());
        assertThat(users.existsByEmail("second@example.com")).isFalse();
    }

    @Test
    void bootstrapAdminNeverPromotesAnExistingNonAdminUser() throws Exception {
        createUser("jane@example.com", GRC);
        var cfg = new SecurityProperties.BootstrapAdmin("jane@example.com", "A-very-long-password-1", "Jane");
        new AdminBootstrap(new SecurityProperties(4, null, null, null, cfg), users, roles, encoder)
                .run(new DefaultApplicationArguments());
        assertThat(users.existsByRoles_Name(Role.ADMIN)).isFalse();
    }

    @Test
    void weakJwtSecretIsRejectedByConfigurationValidation() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var weak = new SecurityProperties.Jwt("too-short", "iss", "aud", 15);
            assertThat(factory.getValidator().validate(weak)).isNotEmpty();
            var blank = new SecurityProperties.Jwt("", "iss", "aud", 15);
            assertThat(factory.getValidator().validate(blank)).isNotEmpty();
            var strong = new SecurityProperties.Jwt("x".repeat(40), "iss", "aud", 15);
            assertThat(factory.getValidator().validate(strong)).isEmpty();
            var wildcardCors = new SecurityProperties.Cors(List.of("*"));
            assertThat(factory.getValidator().validate(wildcardCors)).isNotEmpty();
        }
    }
}
