# OutbreakIQ — Backend Architecture & Service Platform

> **AI-Powered Public Health Surveillance Early Warning Platform**  
> Detects unusual community illness patterns using privacy-preserving health indicators, rolling baseline models, statistical anomaly detection, cross-indicator corroboration, and epidemiological investigation workflows.

This repository directory (`backend/`) contains the complete, self-contained Python + FastAPI backend service.

---

## 1. Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application factory, CORS & exception handlers
│   ├── api/
│   │   ├── __init__.py
│   │   ├── router.py               # Central v1 routing table
│   │   └── endpoints/              # Modular API controllers
│   │       ├── __init__.py
│   │       ├── health.py           # /health and /api/v1/health endpoints
│   │       ├── dashboard.py        # /api/v1/dashboard/summary
│   │       ├── regions.py          # /api/v1/regions (directory & trends)
│   │       ├── observations.py     # /api/v1/observations (query & manual submit)
│   │       ├── ingestion.py        # /api/v1/ingestion/csv & /batch
│   │       ├── analysis.py         # /api/v1/analysis (detection & baseline)
│   │       ├── alerts.py           # /api/v1/alerts (explainable alerts & review)
│   │       ├── investigations.py   # /api/v1/investigations (case management)
│   │       ├── data_sources.py     # /api/v1/data-sources (feed health & freshness)
│   │       ├── auth.py             # /api/v1/auth (JWT login & profile)
│   │       └── audit.py            # /api/v1/audit (compliance log search)
│   ├── core/                       # Core configurations, security & DB session
│   │   ├── __init__.py
│   │   ├── config.py               # Pydantic Settings & environment variables
│   │   ├── database.py             # Database engine & session management
│   │   ├── security.py             # Password hashing (PBKDF2) & JWT tokens
│   │   ├── permissions.py          # Role-based access control (RBAC) guards
│   │   └── exceptions.py           # Domain exceptions & HTTP error status codes
│   ├── schemas/                    # Pydantic v2 validation & response contracts
│   │   ├── __init__.py
│   │   ├── common.py               # Standard response envelope & health schemas
│   │   ├── dashboard.py            # Surveillance totals & hotspot models
│   │   ├── region.py               # Jurisdiction & temporal trend schemas
│   │   ├── observation.py          # Aggregate signal schemas & PII rejection
│   │   ├── data_source.py          # Data source metadata & freshness
│   │   ├── analysis.py             # Baseline & anomaly detection outputs
│   │   ├── alert.py                # Explainable alerts, evidence, & review
│   │   ├── investigation.py        # Case investigations & timeline items
│   │   └── auth.py                 # Login, tokens, users, & audit logs
│   ├── services/                   # Business logic & analytical engines
│   │   ├── __init__.py
│   │   ├── validation_service.py   # Input checks, CSV parsing, privacy suppression
│   │   ├── aggregation_service.py  # Temporal & spatial rollups
│   │   ├── baseline_service.py     # Expected normal activity calculation
│   │   ├── detection_service.py    # Statistical deviation engine (Z-score)
│   │   ├── corroboration_service.py# Independent indicator cross-referencing
│   │   ├── explanation_service.py  # Transparent human-readable alert rationales
│   │   ├── alert_service.py        # Alert persistence & cooldown duplicate checks
│   │   ├── dashboard_service.py    # Real-time KPIs & regional hotspot aggregation
│   │   ├── investigation_service.py# Case investigation state machine
│   │   ├── source_health_service.py# Surveillance feed freshness & simulation flags
│   │   └── audit_service.py        # Immutable audit logging for sensitive actions
│   ├── repositories/               # Data access layer
│   │   ├── __init__.py
│   │   ├── observation_repository.py# Aggregate signal storage & duplicate checks
│   │   ├── alert_repository.py     # Alert CRUD & cooldown lookups
│   │   ├── region_repository.py    # Jurisdiction directory & active alert tallies
│   │   └── investigation_repository.py # Case records & chronological audit timeline
│   └── utils/
│       ├── __init__.py
│       ├── dates.py                # ISO dates & rolling window helpers
│       ├── pagination.py           # Pagination parameters & response envelope
│       └── enums.py                # Severity, status, indicators, & roles
├── tests/                          # Automated Pytest suite
│   ├── __init__.py
│   ├── conftest.py                 # Test client & JWT auth token fixtures
│   ├── test_health.py              # Health check endpoints
│   ├── test_validation.py          # Input validation & CSV parsing
│   ├── test_detection.py           # Baseline calculation & anomaly detection
│   ├── test_alerts.py              # Alert generation, review, & cooldown
│   ├── test_privacy.py             # Privacy suppression & PII rejection
│   └── test_investigations.py      # Case investigation workflow & state machine
├── .env.example                    # Environment variable configuration template
├── .gitignore                      # Git exclusion rules
├── requirements.txt                # Python dependencies
├── pytest.ini                      # Pytest configuration
└── README.md                       # Documentation
```

---

## 2. Getting Started

### Prerequisites
- Python 3.10+ (tested on Python 3.10, 3.11, 3.12, 3.14)
- Pip package manager

### Installation

1. Open PowerShell / Terminal in the `backend` folder:
   ```powershell
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   *(On macOS / Linux: `source .venv/bin/activate`)*

3. Install dependencies:
   ```powershell
   python -m pip install --upgrade pip
   python -m pip install -r requirements.txt
   ```

4. Configure environment:
   ```powershell
   Copy-Item .env.example .env
   ```

### Running the API Server

Launch the development server with live reload:
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Once started, access:
- **Interactive OpenAPI Documentation (Swagger UI)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) or [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

---

## 3. Running the Test Suite

Execute all automated unit and integration tests across all 12 modules:
```powershell
cd backend
py -m pytest
```
Or run the helper script:
```powershell
.\run_tests.ps1
```

---

## 4. Teammate Database Integration Guide

The backend repository layer (`app/repositories/`) is decoupled from the analytical engine.
- By default, it operates against an in-memory/SQLite store pre-seeded with synthetic test fixtures, allowing immediate frontend and detection testing without waiting for database provisioning.
- When Member 3 has provisioned PostgreSQL, simply update `DATABASE_URL` in `.env`:
  ```ini
  DATABASE_URL="postgresql+psycopg://postgres:yourpassword@localhost:5432/outbreakiq"
  ```
- The SQLAlchemy session in `app/core/database.py` will automatically connect to PostgreSQL on startup.

---

## 5. Security & Default Prototype Credentials

Authentication uses JWT Bearer tokens with role-based access control (RBAC):

| Username | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| `analyst` | `analyst123` | `ANALYST` | Ingest CSV/batch data, view observations, query audit logs |
| `dr_chen` | `epidemiologist123` | `EPIDEMIOLOGIST` | Triage alerts, open investigations, add case notes |
| `admin` | `admin123` | `ADMIN` | Register new regions, system configuration |
| `viewer` | `viewer123` | `VIEWER` | Read-only access to dashboard and regional trends |

Authenticate via `POST /api/v1/auth/login` to obtain an `access_token`.

---

## 6. Surveillance & Privacy Architecture Principles

1. **Strict Privacy Preservation**: Individual patient data is never accepted. Any payload with identifiable patient fields (`patient_name`, `ssn`, `dob`, etc.) is rejected with HTTP 400. Aggregate counts below 5 (`PRIVACY_MIN_COUNT_THRESHOLD`) are automatically suppressed (`effective_count = null`).
2. **Explainable Anomaly Detection**: An anomaly is an unusual statistical signal relative to a 28-day historical baseline, NOT proof or probability of an outbreak.
3. **Cross-Indicator Corroboration**: Signals are cross-validated against independent streams (e.g., ILI emergency visits corroborated by OTC cough medicine sales) before elevating confidence.
4. **Duplicate Prevention**: Prevents alert fatigue by suppressing duplicate alerts within a 24-hour cooldown window.
