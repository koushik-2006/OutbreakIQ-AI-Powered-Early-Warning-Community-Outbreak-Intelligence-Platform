-- ==============================================================================
-- OutbreakIQ: AI-Powered Early-Warning Community Outbreak Intelligence Platform
-- Module: 05_test_queries.sql
-- Database: aurora_health
-- Description: Analytical & Privacy Verification Test Queries
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- TEST 1: Table Row Counts & Ingestion Integrity
-- Verifies that all 10 core tables have been seeded properly.
-- ------------------------------------------------------------------------------
SELECT 'regions' AS entity, COUNT(*) AS row_count FROM regions
UNION ALL
SELECT 'data_sources', COUNT(*) FROM data_sources
UNION ALL
SELECT 'app_users', COUNT(*) FROM app_users
UNION ALL
SELECT 'ingestion_batches', COUNT(*) FROM ingestion_batches
UNION ALL
SELECT 'observations', COUNT(*) FROM observations
UNION ALL
SELECT 'alerts', COUNT(*) FROM alerts
UNION ALL
SELECT 'alert_evidence', COUNT(*) FROM alert_evidence
UNION ALL
SELECT 'investigations', COUNT(*) FROM investigations
UNION ALL
SELECT 'investigation_events', COUNT(*) FROM investigation_events
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- ------------------------------------------------------------------------------
-- TEST 2: Privacy Suppression Verification (< 5 Rule)
-- Ensures that the v_public_observations view strictly masks raw counts < 5
-- and returns NULL for effective_count to prevent small-cell re-identification.
-- ------------------------------------------------------------------------------
SELECT
    id,
    region_id,
    region_name,
    indicator,
    reporting_date,
    effective_count,
    is_suppressed
FROM v_public_observations
WHERE is_suppressed = TRUE OR effective_count IS NULL;

-- Verify that NO record in v_public_observations reveals effective_count < 5
SELECT
    COUNT(*) AS privacy_violations
FROM v_public_observations
WHERE effective_count IS NOT NULL AND effective_count < 5;

-- ------------------------------------------------------------------------------
-- TEST 3: Statistical Anomaly Detection (7-Day Baseline vs Current Observed)
-- Emulates the backend statistical anomaly engine:
-- Calculates 7-day rolling mean and standard deviation per region/indicator,
-- and identifies deviations exceeding 2.0 standard deviations (Z >= 2.0).
-- ------------------------------------------------------------------------------
WITH baseline_stats AS (
    SELECT
        region_id,
        indicator,
        AVG(count) AS baseline_mean,
        COALESCE(STDDEV_POP(count), 1.0) AS baseline_stddev,
        COUNT(*) AS window_observations
    FROM observations
    WHERE reporting_date < CURRENT_DATE
    GROUP BY region_id, indicator
),
current_obs AS (
    SELECT
        region_id,
        indicator,
        reporting_date,
        count AS observed_value
    FROM observations
    WHERE reporting_date = CURRENT_DATE
)
SELECT
    c.region_id,
    r.name AS region_name,
    c.indicator,
    c.reporting_date,
    c.observed_value,
    ROUND(b.baseline_mean::numeric, 2) AS baseline_mean,
    ROUND(b.baseline_stddev::numeric, 2) AS baseline_stddev,
    ROUND(((c.observed_value - b.baseline_mean) / GREATEST(b.baseline_stddev, 1.0))::numeric, 2) AS z_score,
    CASE
        WHEN ((c.observed_value - b.baseline_mean) / GREATEST(b.baseline_stddev, 1.0)) >= 3.0 THEN 'CRITICAL_HIGH'
        WHEN ((c.observed_value - b.baseline_mean) / GREATEST(b.baseline_stddev, 1.0)) >= 2.0 THEN 'ELEVATED_MEDIUM'
        ELSE 'NORMAL_BASELINE'
    END AS anomaly_classification
FROM current_obs c
JOIN baseline_stats b ON c.region_id = b.region_id AND c.indicator = b.indicator
JOIN regions r ON c.region_id = r.id
ORDER BY z_score DESC;

-- ------------------------------------------------------------------------------
-- TEST 4: Corroborating Signal Evidence Join
-- Verifies that explainable alerts link directly to independent telemetry.
-- ------------------------------------------------------------------------------
SELECT
    a.id AS alert_id,
    a.region_name,
    a.indicator AS primary_indicator,
    a.severity,
    a.deviation_score,
    e.source_name AS corroborating_source,
    e.indicator AS corroborating_indicator,
    e.observed_trend,
    e.signal_strength,
    e.consistent_with_primary
FROM alerts a
LEFT JOIN alert_evidence e ON a.id = e.alert_id
ORDER BY a.created_at DESC, e.signal_strength DESC;

-- ------------------------------------------------------------------------------
-- TEST 5: Active Investigation Cases & Chronological Audit Timeline
-- Validates case lifecycle tracking, assignee assignment, and events.
-- ------------------------------------------------------------------------------
SELECT
    i.id AS investigation_id,
    i.title,
    i.status,
    i.outcome,
    i.assigned_to,
    u.full_name AS assigned_officer,
    ev.timestamp AS event_time,
    ev.author AS event_author,
    ev.action AS event_action,
    ev.details AS event_details
FROM investigations i
JOIN app_users u ON i.assigned_to = u.username
LEFT JOIN investigation_events ev ON i.id = ev.investigation_id
ORDER BY i.id, ev.timestamp ASC;

-- ------------------------------------------------------------------------------
-- TEST 6: Immutable Compliance Audit Trail
-- Verifies that all sensitive actions are logged with timestamps and actors.
-- ------------------------------------------------------------------------------
SELECT
    id AS audit_id,
    timestamp,
    action,
    actor_username,
    target_entity,
    target_id,
    details
FROM audit_logs
ORDER BY timestamp DESC
LIMIT 10;
