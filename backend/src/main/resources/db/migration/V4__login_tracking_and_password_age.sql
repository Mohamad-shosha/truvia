-- Dashboard foundation: login tracking and password age.
--   last_login_at        : time of the user's most recent successful sign-in.
--   password_changed_at  : time the user last chose their own password. NULL means the account
--                          still uses a password set by an administrator (creation or reset).
ALTER TABLE users
    ADD COLUMN last_login_at       DATETIME(6) NULL,
    ADD COLUMN password_changed_at DATETIME(6) NULL;

-- One row per successful sign-in. Unlike refresh_tokens (which are purged after expiry) this is
-- the durable history used for activity trends.
CREATE TABLE login_events (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    remember_me TINYINT(1)  NOT NULL DEFAULT 0,
    created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_login_events_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_login_events_created ON login_events (created_at);
CREATE INDEX idx_login_events_user_created ON login_events (user_id, created_at);

-- Backfill from existing refresh-token history: every token family is exactly one sign-in.
INSERT INTO login_events (user_id, remember_me, created_at)
SELECT user_id, MAX(remember_me), MIN(created_at)
FROM refresh_tokens
GROUP BY family_id, user_id;

UPDATE users u
SET u.last_login_at = (SELECT MAX(e.created_at) FROM login_events e WHERE e.user_id = u.id);
