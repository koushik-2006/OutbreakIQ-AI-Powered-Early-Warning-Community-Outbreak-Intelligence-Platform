-- ==============================================================================
-- OutbreakIQ: AI-Powered Early-Warning Community Outbreak Intelligence Platform
-- Module: 04_seed_demo.sql
-- Database: aurora_health
-- Description: Demonstration Seed Fixtures Across All 10 Entities
-- ==============================================================================

-- 1. Seed Surveillance Regions
INSERT INTO regions (id, name, code, parent_id, population, latitude, longitude, active_alerts_count, total_observations_count, last_signal_date)
VALUES
('REG-METRO-N', 'Metro North District', 'MN-01', 'STATE-01', 420000, 40.7831, -73.9712, 2, 240, CURRENT_DATE),
('REG-METRO-S', 'Metro South District', 'MS-02', 'STATE-01', 380000, 40.7128, -74.0060, 1, 210, CURRENT_DATE),
('REG-EAST-SUB', 'Eastern Suburbs', 'ES-03', 'STATE-01', 290000, 40.7282, -73.7949, 0, 180, CURRENT_DATE),
('REG-WEST-VAL', 'Western Valley', 'WV-04', 'STATE-01', 315000, 40.6976, -74.1444, 0, 160, CURRENT_DATE),
('REG-DOWNTOWN', 'Downtown Central', 'DT-05', 'STATE-01', 510000, 40.7589, -73.9851, 1, 320, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Data Sources
INSERT INTO data_sources (id, name, source_type, indicator, frequency, is_active, is_simulated, last_received_at, facility_count, coverage_notes)
VALUES
('SRC-SYNDROMIC-01', 'Metro Syndromic Emergency Feeds', 'EHR_EMERGENCY', 'ILI', 'DAILY', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '2 hours', 18, '100% tertiary hospitals reporting nominal aggregate syndromic volume.'),
('SRC-PHARM-01', 'Retail OTC Surveillance Network', 'PHARMACY_SALES', 'OTC_COUGH_COLD', 'DAILY', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '1 hour', 42, 'Major community pharmacy chains reporting OTC respiratory transactions.'),
('SRC-CLINIC-01', 'Sentinel Outpatient Network', 'SENTINEL_CLINIC', 'RESPIRATORY_CLINIC', 'DAILY', TRUE, FALSE, CURRENT_TIMESTAMP - INTERVAL '3 hours', 12, 'Family medicine and urgent care sentinel clinics.')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed App Users
-- Passwords hashed with PBKDF2 matching backend: analyst123, epidemiologist123, admin123, viewer123
INSERT INTO app_users (id, username, hashed_password, role, full_name, email, is_active)
VALUES
('USR-001', 'analyst', 'pbkdf2:sha256:100000$c2VjdXJlX3NhbHQ$5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'ANALYST', 'Senior Data Analyst', 'analyst@outbreakiq.internal', TRUE),
('USR-002', 'dr_chen', 'pbkdf2:sha256:100000$c2VjdXJlX3NhbHQ$5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'EPIDEMIOLOGIST', 'Dr. Sarah Chen (Chief Epidemiologist)', 'schen@outbreakiq.internal', TRUE),
('USR-003', 'admin', 'pbkdf2:sha256:100000$c2VjdXJlX3NhbHQ$5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'ADMIN', 'Surveillance System Admin', 'admin@outbreakiq.internal', TRUE),
('USR-004', 'viewer', 'pbkdf2:sha256:100000$c2VjdXJlX3NhbHQ$5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'VIEWER', 'Public Health Stakeholder', 'viewer@outbreakiq.internal', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Ingestion Batches
INSERT INTO ingestion_batches (id, source_id, batch_type, status, records_received, records_ingested, records_suppressed, ingested_by, error_log)
VALUES
('BATCH-2026-10-01', 'SRC-SYNDROMIC-01', 'SCHEDULED_FEED', 'COMPLETED', 150, 148, 2, 'analyst', NULL)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Historical Observations (Sample 30-day baseline highlights)
INSERT INTO observations (id, region_id, indicator, reporting_date, count, effective_count, is_suppressed, source_id, batch_id, metadata_json)
VALUES
-- Metro North ILI anomaly spike
('OBS-MN-ILI-T0', 'REG-METRO-N', 'ILI', CURRENT_DATE, 98, 98, FALSE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-ILI-T1', 'REG-METRO-N', 'ILI', CURRENT_DATE - INTERVAL '1 day', 95, 95, FALSE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-ILI-T2', 'REG-METRO-N', 'ILI', CURRENT_DATE - INTERVAL '2 days', 92, 92, FALSE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-ILI-T3', 'REG-METRO-N', 'ILI', CURRENT_DATE - INTERVAL '3 days', 48, 48, FALSE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-ILI-T4', 'REG-METRO-N', 'ILI', CURRENT_DATE - INTERVAL '4 days', 45, 45, FALSE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
-- Corroborating OTC Pharmacy sales spike in Metro North
('OBS-MN-OTC-T0', 'REG-METRO-N', 'OTC_COUGH_COLD', CURRENT_DATE, 135, 135, FALSE, 'SRC-PHARM-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-MN-OTC-T1', 'REG-METRO-N', 'OTC_COUGH_COLD', CURRENT_DATE - INTERVAL '1 day', 128, 128, FALSE, 'SRC-PHARM-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
-- Downtown Clinic Respiratory surge
('OBS-DT-RESP-T0', 'REG-DOWNTOWN', 'RESPIRATORY_CLINIC', CURRENT_DATE, 72, 72, FALSE, 'SRC-CLINIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
('OBS-DT-RESP-T1', 'REG-DOWNTOWN', 'RESPIRATORY_CLINIC', CURRENT_DATE - INTERVAL '1 day', 68, 68, FALSE, 'SRC-CLINIC-01', 'BATCH-2026-10-01', '{"synthetic": true}'),
-- Privacy Suppression Test Case (< 5 count)
('OBS-WV-ILI-SMALL', 'REG-WEST-VAL', 'ILI', CURRENT_DATE - INTERVAL '5 days', 3, NULL, TRUE, 'SRC-SYNDROMIC-01', 'BATCH-2026-10-01', '{"privacy_masked": true}')
ON CONFLICT (id) DO NOTHING;

-- 6. Seed Preliminary Alerts
INSERT INTO alerts (id, region_id, region_name, indicator, reporting_date, observed_value, baseline_expected, deviation_score, severity, confidence, explanation, evidence_summary, data_quality_notes, review_status, reviewed_by, reviewed_at, review_notes)
VALUES
('ALT-METRO-N-001', 'REG-METRO-N', 'Metro North District', 'ILI', CURRENT_DATE, 98, 45.2, 3.42, 'HIGH', 'HIGH',
 'Observed aggregate ILI count (98) exceeds 28-day rolling baseline (45.2 ± 15.4) by 3.42 standard deviations. Signal is corroborated by a 35% surge in OTC cough/cold remedy transactions across local retail pharmacies.',
 'Primary signal: Syndromic ILI visits elevated for 2 consecutive reporting intervals.',
 'Data freshness: updated 2 hours ago. 100% reporting facilities reporting.',
 'PENDING_REVIEW', NULL, NULL, NULL),
('ALT-DOWNTOWN-002', 'REG-DOWNTOWN', 'Downtown Central', 'RESPIRATORY_CLINIC', CURRENT_DATE - INTERVAL '1 day', 72, 41.0, 2.65, 'MEDIUM', 'MEDIUM',
 'Respiratory outpatient visits (72) elevated 2.65 standard deviations above 28-day rolling average (41.0).',
 'Unusual mid-week cluster in commercial core.',
 'All ambulatory sentinel feeds operating nominally.',
 'UNDER_INVESTIGATION', 'dr_chen', CURRENT_TIMESTAMP - INTERVAL '14 hours', 'Triage started; checking school district attendance data.')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Alert Evidence (Normalized Corroboration)
INSERT INTO alert_evidence (id, alert_id, evidence_type, indicator, source_name, observed_trend, signal_strength, consistent_with_primary, evidence_payload)
VALUES
('EVD-001', 'ALT-METRO-N-001', 'SECONDARY_INDICATOR', 'OTC_COUGH_COLD', 'Retail OTC Surveillance Network', '+35% week-over-week increase in retail cough/cold sales', 'STRONG', TRUE, '{"percent_change": 35.0, "source_id": "SRC-PHARM-01"}')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Investigations
INSERT INTO investigations (id, alert_id, title, region_id, indicator, status, outcome, assigned_to, created_by, resolution_summary)
VALUES
('INV-2025-001', 'ALT-DOWNTOWN-002', 'Downtown Clinic Respiratory Surge Investigation', 'REG-DOWNTOWN', 'RESPIRATORY_CLINIC', 'IN_PROGRESS', 'UNDER_EVALUATION', 'dr_chen', 'dr_chen', NULL)
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Investigation Events (Chronological Audit Timeline)
INSERT INTO investigation_events (id, investigation_id, timestamp, author, action, details)
VALUES
('EVT-001', 'INV-2025-001', CURRENT_TIMESTAMP - INTERVAL '14 hours', 'dr_chen', 'INVESTIGATION_OPENED', 'Triggered from alert ALT-DOWNTOWN-002: Respiratory visits exceeding expected baseline.'),
('EVT-002', 'INV-2025-001', CURRENT_TIMESTAMP - INTERVAL '8 hours', 'dr_chen', 'NOTE_ADDED', 'Contacted sentinel clinic coordinator; checking if flu season or event cluster.')
ON CONFLICT (id) DO NOTHING;

-- 10. Seed Compliance Audit Event
INSERT INTO audit_logs (id, timestamp, action, actor_username, target_entity, target_id, details)
VALUES
('AUD-INIT-001', CURRENT_TIMESTAMP - INTERVAL '14 hours', 'INVESTIGATION_CREATE', 'dr_chen', 'Investigation', 'INV-2025-001', 'Investigation created for alert ALT-DOWNTOWN-002: Downtown Clinic Respiratory Surge Investigation')
ON CONFLICT (id) DO NOTHING;
