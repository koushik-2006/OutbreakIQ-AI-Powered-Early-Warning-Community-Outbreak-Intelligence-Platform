# OutbreakIQ — AI-Powered Early-Warning Community Outbreak Intelligence Platform

> **SYNAPSE 2026 | Problem Statement PS-021**
> AI-Powered Early-Warning Community Outbreak Intelligence Platform

OutbreakIQ is an end-to-end public health surveillance platform designed to detect emerging localized disease clusters before clinical case surges overwhelm regional healthcare systems. By integrating privacy-preserving syndromic telemetry, rolling historical baseline calculation, modified Z-score anomaly detection, multi-source indicator corroboration, and epidemiological case investigation workflows, OutbreakIQ equips public health authorities with actionable, explainable early-warning intelligence.

---

## 1. System Architecture

```
OutbreakIQ/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS (Stitch Dark Theme)
│   ├── src/
│   │   ├── components/map/       # Real Leaflet Geographic Surveillance Map with hotspot clusters
│   │   ├── features/             # Dashboard, Alerts, Investigations, Regions, Data Sources, Reports
│   │   ├── services/             # Centralized API client (apiClient.ts) with graceful demo fallback
│   │   └── types/                # Strict TypeScript domain interfaces
│   ├── package.json
│   └── vite.config.ts            # Relative base path for GitHub Pages & production bundling
│
├── backend/                      # Python & FastAPI High-Performance Surveillance Engine
│   ├── app/
│   │   ├── api/endpoints/        # REST endpoints: health, dashboard, alerts, investigations, regions, auth
│   │   ├── core/                 # Config, security, database session lifecycle, error handlers
│   │   ├── models/               # SQLAlchemy ORM models matching aurora_health schema
│   │   ├── schemas/              # Pydantic v2 validation models & PII redaction filters
│   │   └── services/             # Baseline engine, statistical Z-score detector, alert generator
│   ├── requirements.txt
│   └── Dockerfile
│
├── database/                     # PostgreSQL (aurora_health) Module
│   ├── 01_schema.sql             # 10 core DDL relational tables (PKs, FKs, CASCADE rules)
│   ├── 02_indexes.sql            # Performance indexes on region, indicator, reporting_date
│   ├── 03_views.sql              # Analytical views & small-cell privacy suppression (< 5 count rule)
│   ├── 04_seed_demo.sql          # 30-day baseline surveillance seed fixtures & synthetic anomalies
│   ├── 05_test_queries.sql       # Query validation scripts
│   ├── 06_reset_demo.sql         # Teardown & clean state reseed script
│   ├── ERD.md                    # Detailed Entity Relationship Diagram & table dictionary
│   ├── init_db.py                # Database initializer & multi-engine seeder (PostgreSQL / SQLite)
│   └── test_suite.py             # Database integrity, foreign-key, and privacy test runner
│
├── .github/workflows/deploy.yml  # GitHub Actions automated Pages build & deployment
├── docker-compose.yml            # Multi-container orchestration (PostgreSQL + Backend + Frontend)
├── test_system_integration.py    # System-wide 7-suite end-to-end verification test runner
└── README.md
```

---

## 2. Core Principles & Public Health Rigor

- **Signal, Not Diagnosis**: An anomaly represents a statistically significant deviation from historical expectation, serving as an alert for human epidemiological triage—not a diagnostic proof or automatic declaration of an outbreak.
- **Privacy-Preserving Ingestion**: Strict small-cell suppression masks cell counts below 5 (`effective_count = NULL, is_suppressed = TRUE`). Patient identifiers (names, SSNs, phone numbers) are blocked at the ingestion schema layer.
- **Explainable Anomaly Scoring**: Every preliminary alert outputs an explainable rationale detailing baseline mean, standard deviation, observed count, Z-score deviation, and corroborating cross-indicator telemetry (e.g. concurrent OTC cough syrup sales surges).
- **Audit Compliance**: All triage actions, status changes, and case notes are persisted chronologically to `investigations`, `investigation_events`, and `audit_logs`.

---

## 3. Quickstart: Running Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **PostgreSQL**: v14+ (Optional: SQLite local fallback is built-in for zero-config testing)

---

### Step 1: Initialize Database & Seed Baseline Data

```bash
# Initialize schema and seed 30 days of synthetic baseline surveillance data
python database/init_db.py
```

> **PostgreSQL Configuration**: To connect to a local or remote PostgreSQL instance instead of the default local SQLite database, configure `DATABASE_URL` in `backend/.env` or export it:
> ```bash
> # Windows PowerShell:
> $env:DATABASE_URL="postgresql+psycopg://postgres:postgrespassword@localhost:5432/aurora_health"
> # Linux / macOS:
> export DATABASE_URL="postgresql+psycopg://postgres:postgrespassword@localhost:5432/aurora_health"
> ```

---

### Step 2: Start the FastAPI Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux / macOS:
# source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn app.main:app --reload --port 8000
```

- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Service Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Step 3: Start the Frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

- **Surveillance Console**: [http://localhost:5173](http://localhost:5173)

---

### Alternative: Docker Compose (Full Stack)

If Docker is available on your machine:
```bash
docker compose up --build -d
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432` (`aurora_health`)

---

## 4. Prototype Roles & Credentials

Test role-based access control (RBAC) directly in the console or authenticate via `POST /api/v1/auth/login`:

| Username | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| `dr_chen` | `epidemiologist123` | `EPIDEMIOLOGIST` | Triage preliminary alerts, open investigations, add case notes, record outcomes |
| `analyst` | `analyst123` | `ANALYST` | Run anomaly detection scans, ingest surveillance batches, inspect telemetry |
| `admin` | `admin123` | `ADMIN` | Register new jurisdictions/regions, manage system configuration |
| `viewer` | `viewer123` | `VIEWER` | Read-only executive dashboard, regional trend analysis |

---

## 5. Automated Verification & Test Commands

### 1. Database Integrity Test Suite
```bash
python database/test_suite.py
```
- Verifies existence of all 10 core tables and views
- Enforces `< 5` small-cell privacy suppression policy
- Validates primary keys, foreign keys, unique constraint deduplication, and seed record counts

### 2. Backend Unit & Integration Tests (40 Tests)
```bash
python -m pytest backend
```
- ✅ Health endpoints (`/health`, `/api/v1/health`)
- ✅ Rolling baseline calculations & Z-Score anomaly detection engine
- ✅ Strict PII rejection and privacy suppression
- ✅ Explainable alert generation, deduplication cooldowns, and triage workflows
- ✅ Epidemiological case investigations and chronological timeline updates
- ✅ CSV parsing, validation, and batch ingestion
- ✅ Repository layer CRUD and End-to-End Surveillance Pipeline

### 3. End-to-End System Integration Verification (7 Suites)
```bash
python test_system_integration.py
```
- Tests complete flow: Health -> Dashboard Summary -> Regional Trends -> Statistical Anomaly Trigger -> Alert Triage -> Privacy Enforcement -> Frontend Production Build Assets.

### 4. Frontend Production Build & Code Quality
```bash
cd frontend
npm run build    # TypeScript check (tsc -b) & Vite production bundle
npm run lint     # OxLint code analysis
```

---

## 6. GitHub Pages Deployment

- **Deployment Workflow**: Fully automated via `.github/workflows/deploy.yml` on push to `main`.
- **Repository URL**: `https://github.com/koushik-2006/OutbreakIQ-AI-Powered-Early-Warning-Community-Outbreak-Intelligence-Platform`
- **GitHub Pages URL**: `https://koushik-2006.github.io/OutbreakIQ-AI-Powered-Early-Warning-Community-Outbreak-Intelligence-Platform/`
- **Architecture Separation**: The static frontend bundle is served via GitHub Pages. The FastAPI backend and PostgreSQL database are hosted on cloud container infrastructure.
- **Client-Side Routing**: Built with `createHashRouter` to prevent 404 errors on page reload across GitHub Pages paths.
- **Standalone Demo Mode**: When the hosted frontend detects that the remote backend is unreachable, it seamlessly activates Standalone Demo Mode with pre-seeded synthetic data so all 6 screens and workflows can be previewed without broken UI states.

---

## 7. Troubleshooting & Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Port 8000 or 5173 in use** | A previous server process is running | Terminate the process or pass custom ports: `uvicorn app.main:app --port 8001` or `npm run dev -- --port 5174` |
| **CORS policy error in browser** | Origin not whitelisted | Add client URL to `BACKEND_CORS_ORIGINS` in `backend/.env` |
| **PostgreSQL unavailable** | Local PostgreSQL service not running | Run `python database/init_db.py` to use the zero-config SQLite development database |
| **Windows CP1252 character encoding** | PowerShell terminal codepage | All scripts output standardized ASCII test indicators (`[PASS]` / `[FAIL]`) to guarantee Windows PowerShell compatibility |
