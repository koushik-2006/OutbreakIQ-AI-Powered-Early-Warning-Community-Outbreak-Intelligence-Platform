# OutbreakIQ — AI-Powered Early Warning Community Outbreak Intelligence Platform

AI-powered public health surveillance platform that detects unusual community illness patterns using privacy-preserving health indicators, rolling baseline statistical anomaly detection, cross-indicator corroboration, geospatial analytics, and epidemiological investigation workflows.

## Repository Overview

- **`backend/`**: Complete FastAPI service providing REST APIs, data ingestion, statistical detection engine, corroboration, alerts, and audit logging. See [`backend/README.md`](backend/README.md) for full architecture and API documentation.

## Quickstart (Backend)

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

