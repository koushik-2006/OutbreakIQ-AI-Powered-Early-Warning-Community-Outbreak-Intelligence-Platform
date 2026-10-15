-- ==============================================================================
-- OutbreakIQ: AI-Powered Community Outbreak Intelligence Platform
-- PostgreSQL Synthetic Surveillance Demonstration Data (PS-021)
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

-- 3. Seed Preliminary Alerts
INSERT INTO alerts (id, region_id, region_name, indicator, reporting_date, observed_value, baseline_expected, deviation_score, severity, confidence, explanation, evidence_summary, corroborating_signals_json, data_quality_notes, review_status, reviewed_by, reviewed_at, review_notes)
VALUES
('ALT-METRO-N-001', 'REG-METRO-N', 'Metro North District', 'ILI', CURRENT_DATE, 98, 45.2, 3.42, 'HIGH', 'HIGH',
 'Observed aggregate ILI count (98) exceeds 28-day rolling baseline (45.2 ± 15.4) by 3.42 standard deviations. Signal is corroborated by a 35% surge in OTC cough/cold remedy transactions across local retail pharmacies.',
 'Primary signal: Syndromic ILI visits elevated for 2 consecutive reporting intervals.',
 '[{"indicator": "OTC_COUGH_COLD", "source_name": "Metro Pharmacy Surveillance", "observed_trend": "+35% week-over-week increase", "signal_strength": "STRONG", "consistent_with_primary": true}]',
 'Data freshness: updated 2 hours ago. 100% reporting facilities reporting.',
 'PENDING_REVIEW', NULL, NULL, NULL),
('ALT-DOWNTOWN-002', 'REG-DOWNTOWN', 'Downtown Central', 'RESPIRATORY_CLINIC', CURRENT_DATE - INTERVAL '1 day', 72, 41.0, 2.65, 'MEDIUM', 'MEDIUM',
 'Respiratory outpatient visits (72) elevated 2.65 standard deviations above 28-day rolling average (41.0).',
 'Unusual mid-week cluster in commercial core.',
 '[]',
 'All ambulatory sentinel feeds operating nominally.',
 'UNDER_INVESTIGATION', 'dr_chen', CURRENT_TIMESTAMP - INTERVAL '14 hours', 'Triage started; checking school district attendance data.')
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Investigations
INSERT INTO investigations (id, alert_id, title, region_id, indicator, status, outcome, assigned_to, created_by, resolution_summary, timeline_json)
VALUES
('INV-2025-001', 'ALT-DOWNTOWN-002', 'Downtown Clinic Respiratory Surge Investigation', 'REG-DOWNTOWN', 'RESPIRATORY_CLINIC', 'IN_PROGRESS', 'UNDER_EVALUATION', 'dr_chen', 'dr_chen', NULL,
 '[{"timestamp": "2026-10-14T14:00:00Z", "author": "dr_chen", "action": "INVESTIGATION_OPENED", "details": "Triggered from alert ALT-DOWNTOWN-002: Respiratory visits exceeding expected baseline."}, {"timestamp": "2026-10-15T08:00:00Z", "author": "dr_chen", "action": "NOTE_ADDED", "details": "Contacted sentinel clinic coordinator; checking if flu season or event cluster."}]')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Compliance Audit Event
INSERT INTO audit_logs (id, timestamp, action, actor_username, target_entity, target_id, details)
VALUES
('AUD-INIT-001', CURRENT_TIMESTAMP - INTERVAL '14 hours', 'INVESTIGATION_CREATE', 'dr_chen', 'Investigation', 'INV-2025-001', 'Investigation created for alert ALT-DOWNTOWN-002: Downtown Clinic Respiratory Surge Investigation')
ON CONFLICT (id) DO NOTHING;
