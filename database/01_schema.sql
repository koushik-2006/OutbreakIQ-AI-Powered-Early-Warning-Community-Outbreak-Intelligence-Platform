-- ==============================================================================
-- OutbreakIQ: AI-Powered Early-Warning Community Outbreak Intelligence Platform
-- Module: 01_schema.sql
-- Database: aurora_health
-- Description: Core DDL Schema Definition (PS-021)
-- ==============================================================================

-- Create Database if executing in maintenance context (informational)
-- CREATE DATABASE aurora_health;
-- \c aurora_health;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS investigation_events CASCADE;
DROP TABLE IF EXISTS investigations CASCADE;
DROP TABLE IF EXISTS alert_evidence CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS observations CASCADE;
DROP TABLE IF EXISTS ingestion_batches CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;
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

-- ------------------------------------------------------------------------------
-- 2. Data Sources (Sentinel Feeds, Pharmacy Networks, Ambulatory Feeds)
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

-- ------------------------------------------------------------------------------
-- 3. App Users (RBAC: Admin, Epidemiologist, Analyst, Stakeholder Viewer)
-- ------------------------------------------------------------------------------
CREATE TABLE app_users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 4. Ingestion Batches (Audited Batch Ingestion Tracking)
-- ------------------------------------------------------------------------------
CREATE TABLE ingestion_batches (
    id VARCHAR(50) PRIMARY KEY,
    source_id VARCHAR(50) NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    batch_type VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    records_received INTEGER NOT NULL DEFAULT 0,
    records_ingested INTEGER NOT NULL DEFAULT 0,
    records_suppressed INTEGER NOT NULL DEFAULT 0,
    ingested_by VARCHAR(100) NOT NULL REFERENCES app_users(username),
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. Observations (Privacy-Preserving Aggregate Surveillance Records)
-- ------------------------------------------------------------------------------
CREATE TABLE observations (
    id VARCHAR(50) PRIMARY KEY,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    indicator VARCHAR(50) NOT NULL,
    reporting_date DATE NOT NULL,
    count INTEGER NOT NULL CHECK (count >= 0),
    effective_count INTEGER CHECK (effective_count >= 0 OR effective_count IS NULL),
    is_suppressed BOOLEAN NOT NULL DEFAULT FALSE,
    source_id VARCHAR(50) NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    batch_id VARCHAR(50) REFERENCES ingestion_batches(id) ON DELETE SET NULL,
    metadata_json TEXT DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_observation_record UNIQUE (region_id, indicator, reporting_date, source_id)
);

-- ------------------------------------------------------------------------------
-- 6. Alerts (Explainable Statistical Preliminary Alerts)
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
    data_quality_notes TEXT,
    review_status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
    reviewed_by VARCHAR(100) REFERENCES app_users(username),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. Alert Evidence (Normalized Corroborating Signals & Independent Telemetry)
-- ------------------------------------------------------------------------------
CREATE TABLE alert_evidence (
    id VARCHAR(50) PRIMARY KEY,
    alert_id VARCHAR(50) NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL,
    indicator VARCHAR(50) NOT NULL,
    source_name VARCHAR(150) NOT NULL,
    observed_trend VARCHAR(255) NOT NULL,
    signal_strength VARCHAR(20) NOT NULL,
    consistent_with_primary BOOLEAN NOT NULL DEFAULT TRUE,
    evidence_payload TEXT DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 8. Investigations (Public Health Epidemiological Investigation Cases)
-- ------------------------------------------------------------------------------
CREATE TABLE investigations (
    id VARCHAR(50) PRIMARY KEY,
    alert_id VARCHAR(50) NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    region_id VARCHAR(50) NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    indicator VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    outcome VARCHAR(50) NOT NULL DEFAULT 'UNDER_EVALUATION',
    assigned_to VARCHAR(100) NOT NULL REFERENCES app_users(username),
    created_by VARCHAR(100) NOT NULL REFERENCES app_users(username),
    resolution_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 9. Investigation Events (Chronological Case Audit Timeline)
-- ------------------------------------------------------------------------------
CREATE TABLE investigation_events (
    id VARCHAR(50) PRIMARY KEY,
    investigation_id VARCHAR(50) NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    author VARCHAR(100) NOT NULL REFERENCES app_users(username),
    action VARCHAR(50) NOT NULL,
    details TEXT NOT NULL
);

-- ------------------------------------------------------------------------------
-- 10. Audit Logs (System-Wide Immutable Compliance Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(50) NOT NULL,
    actor_username VARCHAR(100) NOT NULL REFERENCES app_users(username),
    target_entity VARCHAR(50) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    details TEXT NOT NULL
);
