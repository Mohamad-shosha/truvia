package com.nextrisk.auth.service;

import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import com.nextrisk.auth.repository.RoleRepository;
import com.nextrisk.auth.repository.UserRepository;
import com.nextrisk.config.SecurityProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * First-admin provisioning. There is no public admin-registration endpoint and no default credentials.
 * An operator supplies BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD through the environment; if (and only if)
 * no ROLE_ADMIN user exists yet and the email is unused, that account is created. Remove the variables afterwards.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final SecurityProperties.BootstrapAdmin config;
    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder encoder;

    public AdminBootstrap(SecurityProperties properties, UserRepository users, RoleRepository roles,
            PasswordEncoder encoder) {
        this.config = properties.bootstrapAdmin();
        this.users = users;
        this.roles = roles;
        this.encoder = encoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (config == null || !config.isConfigured()) {
            return;
        }
        if (users.existsByRoles_Name(Role.ADMIN)) {
            log.info("Bootstrap admin skipped: an administrator already exists. Remove BOOTSTRAP_ADMIN_* from the environment.");
            return;
        }
        String email = AuthService.normalizeEmail(config.email());
        if (users.existsByEmail(email)) {
            log.warn("Bootstrap admin skipped: the configured email belongs to an existing non-admin user (no automatic promotion).");
            return;
        }
        if (config.password().length() < 12) {
            throw new IllegalStateException("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters");
        }
        String name = config.fullName() == null || config.fullName().isBlank() ? "Platform Administrator" : config.fullName();
        User admin = new User(name, email, encoder.encode(config.password()));
        admin.getRoles().add(roles.findByName(Role.ADMIN).orElseThrow());
        users.save(admin);
        log.warn("Bootstrap administrator created (userId={}). Remove BOOTSTRAP_ADMIN_* from the environment now.", admin.getId());
    }
}
