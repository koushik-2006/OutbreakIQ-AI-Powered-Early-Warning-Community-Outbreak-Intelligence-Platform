from fastapi import APIRouter
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import dashboard_service

router = APIRouter()


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    summary="Dashboard Overview",
    description="Returns aggregate surveillance metrics, active alert counts by severity, open investigations, and geographic hotspots.",
)
async def get_dashboard_summary():
    return dashboard_service.get_dashboard_summary()
