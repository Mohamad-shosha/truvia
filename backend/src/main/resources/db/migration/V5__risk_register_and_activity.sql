-- Phase 4 foundation: central risk register, daily posture snapshots and an activity log.

CREATE TABLE risks (
    id                  BIGINT       NOT NULL AUTO_INCREMENT,
    code                VARCHAR(20)  NULL,
    title               VARCHAR(200) NOT NULL,
    description         VARCHAR(2000) NULL,
    category            VARCHAR(60)  NOT NULL,
    business_service    VARCHAR(120) NOT NULL,
    owner               VARCHAR(120) NOT NULL,
    -- 1 (rare / negligible) .. 5 (almost certain / severe)
    likelihood          TINYINT      NOT NULL,
    impact              TINYINT      NOT NULL,
    residual_likelihood TINYINT      NOT NULL,
    residual_impact     TINYINT      NOT NULL,
    treatment           VARCHAR(20)  NOT NULL,
    status              VARCHAR(20)  NOT NULL,
    -- Rows created by the demo-data seeder (nextrisk.demo-data.enabled). Remove all sample data with:
    --   DELETE FROM risks WHERE sample = 1; DELETE FROM risk_snapshots WHERE sample = 1;
    --   DELETE FROM activity_events WHERE sample = 1;
    sample              TINYINT(1)   NOT NULL DEFAULT 0,
    created_by          BIGINT       NULL,
    created_at          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at          DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    closed_at           DATETIME(6)  NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_risks_code UNIQUE (code),
    CONSTRAINT fk_risks_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT chk_risks_likelihood CHECK (likelihood BETWEEN 1 AND 5),
    CONSTRAINT chk_risks_impact CHECK (impact BETWEEN 1 AND 5),
    CONSTRAINT chk_risks_res_likelihood CHECK (residual_likelihood BETWEEN 1 AND 5),
    CONSTRAINT chk_risks_res_impact CHECK (residual_impact BETWEEN 1 AND 5),
    CONSTRAINT chk_risks_treatment CHECK (treatment IN ('MITIGATE', 'ACCEPT', 'TRANSFER', 'AVOID')),
    CONSTRAINT chk_risks_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED'))
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_risks_status ON risks (status);

-- One row per UTC day: the posture used for trend lines and "vs last period" deltas.
CREATE TABLE risk_snapshots (
    snapshot_date  DATE         NOT NULL,
    active_risks   INT          NOT NULL,
    high_risks     INT          NOT NULL,
    critical_risks INT          NOT NULL,
    risk_score     DECIMAL(5,1) NOT NULL,
    sample         TINYINT(1)   NOT NULL DEFAULT 0,
    PRIMARY KEY (snapshot_date)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Who did what, for the dashboard's Recent Activity feed (seed of the Phase 9 audit log).
CREATE TABLE activity_events (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    actor_id    BIGINT       NULL,
    actor_name  VARCHAR(120) NULL,
    type        VARCHAR(40)  NOT NULL,
    title       VARCHAR(200) NOT NULL,
    detail      VARCHAR(400) NULL,
    sample      TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_activity_actor FOREIGN KEY (actor_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_activity_created ON activity_events (created_at);
