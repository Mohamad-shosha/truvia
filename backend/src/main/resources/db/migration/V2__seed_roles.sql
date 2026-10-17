-- Idempotent: re-running never duplicates roles. No users (and no admin credentials) are seeded here.
INSERT IGNORE INTO roles (name) VALUES
    ('ROLE_ADMIN'),
    ('ROLE_CISO'),
    ('ROLE_GRC_ANALYST'),
    ('ROLE_SOC_ANALYST'),
    ('ROLE_PENTESTER');
