-- ==============================================================================
-- OutbreakIQ: AI-Powered Early-Warning Community Outbreak Intelligence Platform
-- Module: 02_indexes.sql
-- Database: aurora_health
-- Description: Indexes for Performance, Fast Lookups & Constraints
-- ==============================================================================

-- Regions
CREATE INDEX IF NOT EXISTS idx_regions_code ON regions(code);
CREATE INDEX IF NOT EXISTS idx_regions_parent ON regions(parent_id);

-- Data Sources
CREATE INDEX IF NOT EXISTS idx_data_sources_indicator ON data_sources(indicator);
CREATE INDEX IF NOT EXISTS idx_data_sources_active ON data_sources(is_active);

-- Users
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);

-- Ingestion Batches
CREATE INDEX IF NOT EXISTS idx_ingestion_batches_source ON ingestion_batches(source_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_batches_created ON ingestion_batches(created_at);

-- Observations (Critical high-volume longitudinal queries)
CREATE INDEX IF NOT EXISTS idx_observations_lookup ON observations(region_id, indicator, reporting_date);
CREATE INDEX IF NOT EXISTS idx_observations_date ON observations(reporting_date);
CREATE INDEX IF NOT EXISTS idx_observations_source ON observations(source_id);
CREATE INDEX IF NOT EXISTS idx_observations_suppressed ON observations(is_suppressed);

-- Alerts
CREATE INDEX IF NOT EXISTS idx_alerts_region_date ON alerts(region_id, reporting_date);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(review_status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_indicator ON alerts(indicator);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);

-- Alert Evidence
CREATE INDEX IF NOT EXISTS idx_alert_evidence_alert ON alert_evidence(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_evidence_indicator ON alert_evidence(indicator);

-- Investigations
CREATE INDEX IF NOT EXISTS idx_investigations_status ON investigations(status);
CREATE INDEX IF NOT EXISTS idx_investigations_region ON investigations(region_id);
CREATE INDEX IF NOT EXISTS idx_investigations_assigned ON investigations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_investigations_updated ON investigations(updated_at DESC);

-- Investigation Events
CREATE INDEX IF NOT EXISTS idx_investigation_events_inv ON investigation_events(investigation_id);
CREATE INDEX IF NOT EXISTS idx_investigation_events_time ON investigation_events(timestamp DESC);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_username);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(target_entity, target_id);
