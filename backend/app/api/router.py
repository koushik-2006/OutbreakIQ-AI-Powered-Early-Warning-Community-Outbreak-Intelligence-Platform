from fastapi import APIRouter

from app.api.endpoints import (
    alerts,
    analysis,
    audit,
    auth,
    dashboard,
    data_sources,
    health,
    ingestion,
    investigations,
    observations,
    regions,
)

api_router = APIRouter()

# Health (versioned: /api/v1/health)
api_router.include_router(health.router, tags=["Health"])

# Executive Dashboard (/api/v1/dashboard/summary)
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

# Jurisdictions & Regions (/api/v1/regions)
api_router.include_router(regions.router, prefix="/regions", tags=["Regions"])

# Aggregate Surveillance Observations (/api/v1/observations)
api_router.include_router(observations.router, prefix="/observations", tags=["Observations"])

# Secure Data Ingestion (/api/v1/ingestion)
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["Ingestion"])

# Analytical Anomaly Detection & Baseline (/api/v1/analysis)
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])

# Explainable Alerts & Triaging (/api/v1/alerts)
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])

# Case Investigations Workflow (/api/v1/investigations)
api_router.include_router(investigations.router, prefix="/investigations", tags=["Investigations"])

# Surveillance Feed Health & Status (/api/v1/data-sources)
api_router.include_router(data_sources.router, prefix="/data-sources", tags=["Data Sources"])

# User Authentication & RBAC (/api/v1/auth)
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Compliance Audit Logging (/api/v1/audit)
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])
