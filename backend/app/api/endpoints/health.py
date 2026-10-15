from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings
from app.core.database import check_db_connection
from app.schemas.common import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Check whether the API service and its database connection are operational.",
)
async def get_health():
    db_status = check_db_connection()
    return HealthResponse(
        status="healthy" if db_status.get("status") in ("connected", "unconfigured") else "degraded",
        version="1.0.0",
        service=settings.PROJECT_NAME,
        database=db_status,
        timestamp=datetime.now(timezone.utc),
    )
