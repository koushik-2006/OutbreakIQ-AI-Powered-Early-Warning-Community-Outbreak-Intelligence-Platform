-- ==============================================================================
-- OutbreakIQ: AI-Powered Early-Warning Community Outbreak Intelligence Platform
-- Module: 03_views.sql
-- Database: aurora_health
-- Description: Analytical & Privacy-Preserving Surveillance Views
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. v_public_observations (Strict Privacy Enforcement Policy)
-- Hides raw count for small numbers (< 5) to prevent re-identification.
-- Downstream public consumers receive effective_count only.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_public_observations AS
SELECT
    o.id,
    o.region_id,
    r.name AS region_name,
    r.code AS region_code,
    o.indicator,
    o.reporting_date,
    CASE
        WHEN o.is_suppressed OR o.count < 5 THEN NULL
        ELSE o.effective_count
    END AS effective_count,
    o.is_suppressed,
    o.source_id,
    s.name AS source_name,
    o.created_at
FROM observations o
JOIN regions r ON o.region_id = r.id
JOIN data_sources s ON o.source_id = s.id;

-- ------------------------------------------------------------------------------
-- 2. v_regional_summary (Executive Dashboard Surveillance Aggregation)
-- Summarizes active alerts and 30-day signal volumes by region.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_regional_summary AS
SELECT
    r.id AS region_id,
    r.name AS region_name,
    r.code AS region_code,
    r.population,
    r.latitude,
    r.longitude,
    COUNT(DISTINCT CASE WHEN a.review_status NOT IN ('RESOLVED', 'DISMISSED') THEN a.id END) AS active_alerts_count,
    COUNT(DISTINCT o.id) AS total_observations_count,
    MAX(o.reporting_date) AS latest_observation_date,
    MAX(CASE WHEN a.severity = 'HIGH' THEN 1 ELSE 0 END) AS has_high_severity_alert
FROM regions r
LEFT JOIN observations o ON r.id = o.region_id
LEFT JOIN alerts a ON r.id = a.region_id
GROUP BY r.id, r.name, r.code, r.population, r.latitude, r.longitude;

-- ------------------------------------------------------------------------------
-- 3. v_active_alerts_detail (Alerts with Corroborating Evidence Tally)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_active_alerts_detail AS
SELECT
    a.id,
    a.region_id,
    a.region_name,
    a.indicator,
    a.reporting_date,
    a.observed_value,
    a.baseline_expected,
    a.deviation_score,
    a.severity,
    a.confidence,
    a.explanation,
    a.evidence_summary,
    a.review_status,
    a.reviewed_by,
    a.reviewed_at,
    a.review_notes,
    COUNT(e.id) AS evidence_count,
    a.created_at,
    a.updated_at
FROM alerts a
LEFT JOIN alert_evidence e ON a.id = e.alert_id
GROUP BY a.id, a.region_id, a.region_name, a.indicator, a.reporting_date,
         a.observed_value, a.baseline_expected, a.deviation_score, a.severity,
         a.confidence, a.explanation, a.evidence_summary, a.review_status,
         a.reviewed_by, a.reviewed_at, a.review_notes, a.created_at, a.updated_at;

-- ------------------------------------------------------------------------------
-- 4. v_investigation_cases (Case Management & Timeline Counts)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_investigation_cases AS
SELECT
    i.id AS investigation_id,
    i.alert_id,
    i.title,
    i.region_id,
    r.name AS region_name,
    i.indicator,
    i.status,
    i.outcome,
    i.assigned_to,
    u.full_name AS assigned_to_name,
    i.created_by,
    i.resolution_summary,
    COUNT(ev.id) AS timeline_event_count,
    i.created_at,
    i.updated_at
FROM investigations i
JOIN regions r ON i.region_id = r.id
JOIN app_users u ON i.assigned_to = u.username
LEFT JOIN investigation_events ev ON i.id = ev.investigation_id
GROUP BY i.id, i.alert_id, i.title, i.region_id, r.name, i.indicator,
         i.status, i.outcome, i.assigned_to, u.full_name, i.created_by,
         i.resolution_summary, i.created_at, i.updated_at;
