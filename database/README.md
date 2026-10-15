# OutbreakIQ: Database Architecture & Setup Guide

**Database Name:** `aurora_health`
**Platform:** PostgreSQL 14+ (Production / Docker) / SQLite (Zero-config local fallback)
**Hackathon:** SYNAPSE 2026 | **Problem Statement:** PS-021 (Early-Warning Community Outbreak Engine)

---

## 1. Directory Structure

```
database/
├── 01_schema.sql         # Core DDL table definitions (10 entities, PKs, FKs, constraints)
├── 02_indexes.sql        # High-performance lookup & foreign-key indexes
├── 03_views.sql          # Analytical & privacy-preserving views (v_public_observations, etc.)
├── 04_seed_demo.sql      # Synthetic surveillance baseline & outbreak scenario seed fixtures
├── 05_test_queries.sql   # Analytical verification queries, privacy & anomaly tests
├── 06_reset_demo.sql     # Safe teardown and clean demo state restoration script
├── ERD.md                # Comprehensive Mermaid diagram & entity dictionary
├── README.md             # This guide
├── docker-compose.yml    # Standalone PostgreSQL 15 service for aurora_health
└── test_suite.py         # Automated database schema, constraint & privacy test suite
```

---

## 2. Core Entities & Relationships

The `aurora_health` relational database implements 10 core entities:

1. **`regions`**: Monitored jurisdictions, geographic centroids (lat/lng), populations, and active alert counters.
2. **`data_sources`**: Sentinel feeds, emergency department EHR feeds, and retail pharmacy OTC sales networks.
3. **`app_users`**: Role-based access control (`ADMIN`, `EPIDEMIOLOGIST`, `ANALYST`, `VIEWER`) with secure hashed credentials.
4. **`ingestion_batches`**: Audited ingestion history recording batch status, received, ingested, and suppressed counts.
5. **`observations`**: Longitudinal aggregate counts with unique constraint on `(region_id, indicator, reporting_date, source_id)` and small-cell privacy masking.
6. **`alerts`**: Explainable preliminary statistical alerts with expected baselines, deviation scores (Z-score), severity, and confidence.
7. **`alert_evidence`**: Normalized corroborating signals (e.g. OTC pharmacy surges) linked to primary alerts.
8. **`investigations`**: Epidemiological case workflows, triage statuses, officer assignments, and resolution notes.
9. **`investigation_events`**: Chronological case audit timeline tracking every action taken by public health officers.
10. **`audit_logs`**: Immutable compliance trail logging actor, action, timestamp, and target entities.

---

## 3. SQL Execution Order

When initializing or migrating PostgreSQL manually, execute the files in their documented sequence:

```bash
# 1. Connect to PostgreSQL and create database
psql -U postgres -c "CREATE DATABASE aurora_health;"

# 2. Run DDL schema (10 tables)
psql -U postgres -d aurora_health -f database/01_schema.sql

# 3. Create performance indexes
psql -U postgres -d aurora_health -f database/02_indexes.sql

# 4. Create analytical & privacy views
psql -U postgres -d aurora_health -f database/03_views.sql

# 5. Load synthetic demonstration fixtures
psql -U postgres -d aurora_health -f database/04_seed_demo.sql

# 6. Run verification queries (Optional)
psql -U postgres -d aurora_health -f database/05_test_queries.sql
```

> [!WARNING]
> **`06_reset_demo.sql`** is a controlled teardown script that truncates operational data to restore the demonstration baseline. **Do not run it in production!**

---

## 4. Quick Local Development Setup

### Option A: Standalone Database via Docker Compose
From the `database/` directory:
```bash
docker compose up -d
```
This launches a PostgreSQL 15 container on port `5432` with `aurora_health` pre-loaded with `01_schema.sql`, `02_indexes.sql`, `03_views.sql`, and `04_seed_demo.sql`.

### Option B: Automatic Python Initialization
From the repository root:
```bash
# Run automated database initializer (PostgreSQL or SQLite fallback)
python -m database.test_suite
```

---

## 5. Environment Configuration

In `backend/.env`:
```ini
# PostgreSQL (Production / Docker / Team):
DATABASE_URL=postgresql+psycopg://postgres:postgrespassword@localhost:5432/aurora_health

# SQLite (Local zero-install default):
DATABASE_URL=sqlite:///./aurora_health.db
```

---

## 6. Privacy & Suppression Rules

In compliance with public health privacy regulations:
- Aggregate observations with counts less than 5 (`count < 5`) are flagged `is_suppressed = TRUE`.
- The `v_public_observations` view automatically sets `effective_count = NULL` for suppressed records.
- Public API endpoints never expose raw counts or mathematical derivations that would re-identify individuals in small populations.

---

## 7. Running Database Verification Tests

To verify schema integrity, foreign key constraints, view functionality, and privacy enforcement:
```bash
python database/test_suite.py
```
Expected output:
```
[PASS] Table 'regions' exists.
[PASS] Table 'observations' exists.
[PASS] View 'v_public_observations' exists.
[PASS] Zero privacy leaks: effective_count is strictly NULL for counts < 5.
[PASS] Duplicate ingestion successfully rejected by unique constraint.
[SUMMARY] ALL DATABASE INTEGRITY TESTS PASSED.
```
