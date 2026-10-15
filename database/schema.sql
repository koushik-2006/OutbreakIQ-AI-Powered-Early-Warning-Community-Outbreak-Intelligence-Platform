-- ==============================================================================
-- OutbreakIQ: AI-Powered Community Outbreak Intelligence Platform
-- PostgreSQL Relational Surveillance Schema (PS-021)
-- ==============================================================================

-- Drop tables in reverse dependency order if resetting
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS investigations CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS observations CASCADE;
DROP TABLE IF EXISTS data_sources CASCADE;
DROP TABLE IF EXISTS regions CASCADE;

-- ------------------------------------------------------------------------------
-- 1. Regions (Jurisdictions & Surveillance Zones)
-- ------------------------------------------------------------------------------
CREATE TABLE regions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    parent_id VARCHAR(50),
    population INTEGER NOT NULL CHECK (population > 0),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    active_alerts_count INTEGER NOT NULL DEFAULT 0,
    total_observations_count INTEGER NOT NULL DEFAULT 0,
    last_signal_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_regions_code ON regions(code);

-- ------------------------------------------------------------------------------
-- 2. Data Sources (Surveillance Feeds & Sentinels)
-- ------------------------------------------------------------------------------
CREATE TABLE data_sources (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    indicator VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_simulated BOOLEAN NOT NULL DEFAULT FALSE,
    last_received_at TIMESTAMPTZ,
    facility_count INTEGER NOT NULL DEFAULT 0,
    coverage_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_data_sources_indicator ON data_sources(indicator);

-- ------------------------------------------------------------------------------
-- 3. Observations (Aggregate Health Counts - Strictly Privacy-Preserving)
-- ------------------------------------------------------------------------------
CREATE TABLE observations (
    id VARCHAR(50) PRIMARY KEY,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    indicator VARCHAR(50) NOT NULL,
    reporting_date DATE NOT NULL,
    count INTEGER NOT NULL CHECK (count >= 0),
    effective_count INTEGER CHECK (effective_count >= 0 OR effective_count IS NULL),
    is_suppressed BOOLEAN NOT NULL DEFAULT FALSE,
    source_id VARCHAR(50) NOT NULL,
    metadata_json TEXT DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_observation_record UNIQUE (region_id, indicator, reporting_date, source_id)
);

CREATE INDEX idx_observations_lookup ON observations(region_id, indicator, reporting_date);
CREATE INDEX idx_observations_date ON observations(reporting_date);

-- ------------------------------------------------------------------------------
-- 4. Alerts (Explainable Preliminary Surveillance Alerts)
-- ------------------------------------------------------------------------------
CREATE TABLE alerts (
    id VARCHAR(50) PRIMARY KEY,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    region_name VARCHAR(150) NOT NULL,
    indicator VARCHAR(50) NOT NULL,
    reporting_date DATE NOT NULL,
    observed_value INTEGER NOT NULL,
    baseline_expected DOUBLE PRECISION NOT NULL,
    deviation_score DOUBLE PRECISION NOT NULL,
    severity VARCHAR(20) NOT NULL,
    confidence VARCHAR(20) NOT NULL,
    explanation TEXT NOT NULL,
    evidence_summary TEXT NOT NULL,
    corroborating_signals_json TEXT DEFAULT '[]',
    data_quality_notes TEXT,
    review_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_region_date ON alerts(region_id, reporting_date);
CREATE INDEX idx_alerts_status ON alerts(review_status);
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- ------------------------------------------------------------------------------
-- 5. Investigations (Public Health Epidemiological Workflows)
-- ------------------------------------------------------------------------------
CREATE TABLE investigations (
    id VARCHAR(50) PRIMARY KEY,
    alert_id VARCHAR(50) NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    indicator VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    outcome VARCHAR(50) NOT NULL DEFAULT 'UNDER_EVALUATION',
    assigned_to VARCHAR(100) NOT NULL,
    created_by VARCHAR(100) NOT NULL,
    resolution_summary TEXT,
    timeline_json TEXT DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investigations_status ON investigations(status);
CREATE INDEX idx_investigations_region ON investigations(region_id);

-- ------------------------------------------------------------------------------
-- 6. Audit Logs (Compliance & Reproducibility)
-- ------------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(50) NOT NULL,
    actor_username VARCHAR(100) NOT NULL,
    target_entity VARCHAR(50) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    details TEXT NOT NULL
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_username);
