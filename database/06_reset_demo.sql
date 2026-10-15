-- ==============================================================================
-- OutbreakIQ: AI-Powered Early-Warning Community Outbreak Intelligence Platform
-- Module: 06_reset_demo.sql
-- Database: aurora_health
-- Description: Controlled Teardown and Demonstration State Reset Script
-- ==============================================================================
-- CAUTION: This script deletes operational observations, alerts, investigations,
-- and audit logs to restore the pristine synthetic demonstration baseline.
-- Do NOT execute in a production or persistent regulatory archive environment!
-- ==============================================================================

BEGIN;

-- 1. Safely Truncate Dependent Data in Reverse Foreign Key Order
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE investigation_events CASCADE;
TRUNCATE TABLE investigations CASCADE;
TRUNCATE TABLE alert_evidence CASCADE;
TRUNCATE TABLE alerts CASCADE;
TRUNCATE TABLE observations CASCADE;
TRUNCATE TABLE ingestion_batches CASCADE;
TRUNCATE TABLE app_users CASCADE;
TRUNCATE TABLE data_sources CASCADE;
TRUNCATE TABLE regions CASCADE;

-- 2. Re-Seed Regions
INSERT INTO regions (id, name, code, parent_id, population, latitude, longitude, active_alerts_count, total_observations_count, last_signal_date)
VALUES
('REG-METRO-N', 'Metro North District', 'MN-01', 'STATE-01', 420000, 40.7831, -73.9712, 2, 240, CURRENT_DATE),
('REG-METRO-S', 'Metro South District', 'MS-02', 'STATE-01', 380000, 40.7128, -74.0060, 1, 210, CURRENT_DATE),
('REG-EAST-SUB', 'Eastern Suburbs', 'ES-03', 'STATE-01', 290000, 40.7282, -73.7949, 0, 180, CURRENT_DATE),
('REG-WEST-VAL', 'Western Valley', 'WV-04', 'STATE-01', 315000, 40.6976, -74.1444, 0, 160, CURRENT_DATE),
('REG-DOWNTOWN', 'Downtown Central', 'DT-05', 'STATE-01', 510000, 40.7589, -73.9851, 1, 320, CURRENT_DATE);

-- 3. Re-Seed Data Sources
INSERT INTO data_sources (id, name, source_type, indicator, frequency, is_active, is_simulated, last_received_at, facility_count, coverage_notes)
VALUES
('SRC-SYNDROMIC-01', 'Metro Syndromic Emergency Feeds', 'EHR_EMERGENCY', 'ILI', 'DAILY', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours', 18, '100% tertiary hospitals reporting nominal aggregate syndromic volume.'),
('SRC-PHARM-01', 'Retail OTC Surveillance Network', 'PHARMACY_SALES', 'OTC_COUGH_COLD', 'DAILY', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '1 hour', 42, 'Major community pharmacy chains reporting OTC respiratory transactions.'),
('SRC-CLINIC-01', 'Sentinel Outpatient Network', 'SENTINEL_CLINIC', 'RESPIRATORY_CLINIC', 'DAILY', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '3 hours', 12, 'Family medicine and urgent care sentinel clinics.');

-- 4. Re-Seed Application Users
INSERT INTO app_users (id, username, hashed_password, role, full_name, email, is_active)
VALUES
('USR-001', 'analyst', 'pbkdf2:sha256:100000$c2VjdXJlX3NhbHQ$5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'ANALYST', 'Senior Data Analyst', 'analyst@outbreakiq.internal', TRUE),
('USR-002', 'dr_chen', 'pbkdf2:sha256:100000$c2VjdXJlX3NhbHQ$5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'EPIDEMIOLOGIST', 'Dr. Sarah Chen (Chief Epidemiologist)', 'schen@outbreakiq.internal', TRUE),
('USR-003', 'admin', 'pbkdf2:sha256:100000$c2VjdXJlX3NhbHQ$5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'ADMIN', 'Surveillance System Admin', 'admin@outbreakiq.internal', TRUE),
('USR-004', 'viewer', 'pbkdf2:sha256:100000$c2VjdXJlX3NhbHQ$5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'VIEWER', 'Public Health Stakeholder', 'viewer@outbreakiq.internal', TRUE);

-- 5. Re-Seed Ingestion Batches
INSERT INTO ingestion_batches (id, source_id, batch_type, status, records_received, records_ingested, records_suppressed, ingested_by, error_log)
VALUES
('BATCH-2026-10-01', 'SRC-SYNDROMIC-01', 'SCHEDULED_FEED', 'COMPLETED', 150, 148, 2, 'analyst', NULL);

-- 6. Re-Seed Observations
INSERT INTO observations (id, region_id, indicator, reporting_date, count, effective_count, is_suppressed, source_id, batch_id, metadata_json)
VALUES
('OBS-MN-ILI-T0', 'REG-METRO-N', 'ILI', CURRENT_DATE, 98, 98, FALSE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-ILI-T1', 'REG-METRO-N', 'ILI', CURRENT_DATE - INTERVAL '1 day', 95, 95, FALSE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-ILI-T2', 'REG-METRO-N', 'ILI', CURRENT_DATE - INTERVAL '2 days', 92, 92, FALSE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-ILI-T3', 'REG-METRO-N', 'ILI', CURRENT_DATE - INTERVAL '3 days', 48, 48, FALSE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-ILI-T4', 'REG-METRO-N', 'ILI', CURRENT_DATE - INTERVAL '4 days', 45, 45, FALSE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-OTC-T0', 'REG-METRO-N', 'OTC_COUGH_COLD', CURRENT_DATE, 135, 135, FALSE, 'SRC-PHARM-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-OTC-T1', 'REG-METRO-N', 'OTC_COUGH_COLD', CURRENT_DATE - INTERVAL '1 day', 128, 128, FALSE, 'SRC-PHARM-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-DT-RESP-T0', 'REG-DOWNTOWN', 'RESPIRATORY_CLINIC', CURRENT_DATE, 72, 72, FALSE, 'SRC-CLINIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-DT-RESP-T1', 'REG-DOWNTOWN', 'RESPIRATORY_CLINIC', CURRENT_DATE - INTERVAL '1 day', 68, 68, FALSE, 'SRC-CLINIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-WV-ILI-SMALL', 'REG-WEST-VAL', 'ILI', CURRENT_DATE - INTERVAL '5 days', 3, NULL, TRUE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"privacy_masked": true}');

-- 7. Re-Seed Alerts
INSERT INTO alerts (id, region_id, region_name, indicator, reporting_date, observed_value, baseline_expected, deviation_score, severity, confidence, explanation, evidence_summary, data_quality_notes, review_status, reviewed_by, reviewed_at, review_notes)
VALUES
('ALT-2026-001', 'REG-METRO-N', 'Metro North District', 'ILI', CURRENT_DATE, 98, 42.4, 3.82, 'HIGH', 'HIGH',
 'Aggregate ILI encounters exceeded the 7-day trailing moving average by +3.82 sigma (observed: 98 cases vs expected 42.4). Anomaly supported by independent pharmacy OTC sales surge.',
 'Emergency EHR feed detected 98 ILI visits. Retail pharmacy cough/cold sales elevated +88% over seasonal norm.',
 'All 18 designated reporting emergency facilities submitted data within the expected 24-hour ingestion window.',
 'PENDING_REVIEW', NULL, NULL, NULL),
('ALT-2026-002', 'REG-DOWNTOWN', 'Downtown Central', 'RESPIRATORY_CLINIC', CURRENT_DATE, 72, 48.1, 2.15, 'MEDIUM', 'MEDIUM',
 'Outpatient sentinel encounters for acute respiratory symptoms are +2.15 sigma above baseline (observed: 72 vs expected 48.1).',
 'Sentinel clinic volumes elevated in 8 of 12 downtown care facilities.',
 'Data completeness verified at 94.2%.',
 'UNDER_INVESTIGATION', 'dr_chen', CURRENT_TIMESTAMP - INTERVAL '4 hours', 'Initiated active cluster tracing across downtown walk-in urgent care clinics.');

-- 8. Re-Seed Alert Evidence
INSERT INTO alert_evidence (id, alert_id, evidence_type, indicator, source_name, observed_trend, signal_strength, consistent_with_primary, evidence_payload)
VALUES
('EVD-001-A', 'ALT-2026-001', 'PHARMACY_SALES', 'OTC_COUGH_COLD', 'Retail OTC Surveillance Network', '+88% sales spike over 7-day average', 'STRONG', TRUE, '{"percent_increase": 88.4, "sample_stores": 42}'),
('EVD-001-B', 'ALT-2026-001', 'SENTINEL_CLINIC', 'RESPIRATORY_CLINIC', 'Sentinel Outpatient Network', '+41% respiratory presentation rate', 'MODERATE', TRUE, '{"percent_increase": 41.2, "sample_clinics": 12}'),
('EVD-002-A', 'ALT-2026-002', 'EHR_EMERGENCY', 'ILI', 'Metro Syndromic Emergency Feeds', 'Moderate uptick (+18%) in young adult cohort', 'MODERATE', TRUE, '{"percent_increase": 18.0, "age_cohort": "18-35"}');

-- 9. Re-Seed Investigations
INSERT INTO investigations (id, alert_id, title, region_id, indicator, status, outcome, assigned_to, created_by, resolution_summary)
VALUES
('INV-2026-001', 'ALT-2026-001', 'Metro North ILI Cluster Investigation', 'REG-METRO-N', 'ILI', 'OPEN', 'UNDER_EVALUATION', 'dr_chen', 'analyst', NULL),
('INV-2026-002', 'ALT-2026-002', 'Downtown Acute Respiratory Sentinel Surge', 'REG-DOWNTOWN', 'RESPIRATORY_CLINIC', 'IN_PROGRESS', 'CORROBORATED', 'dr_chen', 'dr_chen', 'Corroborated by tertiary hospital outpatient surge; community advisories drafted.');

-- 10. Re-Seed Investigation Events
INSERT INTO investigation_events (id, investigation_id, timestamp, author, action, details)
VALUES
('EVT-001', 'INV-2026-001', CURRENT_TIMESTAMP - INTERVAL '6 hours', 'analyst', 'CREATED', 'Investigation initiated following automated statistical threshold trigger (Z = 3.82).'),
('EVT-002', 'INV-2026-001', CURRENT_TIMESTAMP - INTERVAL '5 hours', 'dr_chen', 'STATUS_CHANGE', 'Assigned lead epidemiological investigator. Cross-referencing OTC pharmacy data with laboratory respiratory panels.'),
('EVT-003', 'INV-2026-002', CURRENT_TIMESTAMP - INTERVAL '4 hours', 'dr_chen', 'CREATED', 'Opened sentinel surge investigation for Downtown clinics.');

-- 11. Re-Seed Audit Logs
INSERT INTO audit_logs (id, timestamp, action, actor_username, target_entity, target_id, details)
VALUES
('AUD-001', CURRENT_TIMESTAMP - INTERVAL '24 hours', 'SYSTEM_INIT', 'admin', 'DATABASE', 'aurora_health', 'Initialized database schema and synthetic surveillance seeds.'),
('AUD-002', CURRENT_TIMESTAMP - INTERVAL '6 hours', 'TRIGGER_ALERT', 'analyst', 'ALERT', 'ALT-2026-001', 'Generated explainable preliminary alert for Metro North ILI anomaly (Z = 3.82).'),
('AUD-003', CURRENT_TIMESTAMP - INTERVAL '5 hours', 'CREATE_CASE', 'dr_chen', 'INVESTIGATION', 'INV-2026-001', 'Created investigation case for Metro North ILI spike.');

COMMIT;
