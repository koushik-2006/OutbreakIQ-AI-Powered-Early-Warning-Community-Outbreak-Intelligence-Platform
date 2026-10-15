from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.core.permissions import require_analyst, require_viewer
from app.repositories.observation_repository import observation_repository
from app.schemas.observation import (
    ObservationCreate,
    ObservationFilter,
    ObservationResponse,
)
from app.services.validation_service import validation_service
from app.utils.pagination import PaginatedResponse

router = APIRouter()


@router.get(
    "",
    response_model=PaginatedResponse[ObservationResponse],
    summary="Query Aggregate Observations",
    description="Retrieve aggregate surveillance records with filtering by region, indicator, and reporting dates.",
)
async def list_observations(
    region_id: Optional[str] = Query(None, description="Filter by region ID"),
    indicator: Optional[str] = Query(None, description="Filter by surveillance indicator"),
    source_id: Optional[str] = Query(None, description="Filter by source ID"),
    start_date: Optional[date] = Query(None, description="Earliest reporting date"),
    end_date: Optional[date] = Query(None, description="Latest reporting date"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    filters = ObservationFilter(
        region_id=region_id,
        indicator=indicator,
        source_id=source_id,
        start_date=start_date,
        end_date=end_date,
    )
    offset = (page - 1) * page_size
    items, total = observation_repository.query(filters=filters, offset=offset, limit=page_size)
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)


@router.post(
    "",
    response_model=ObservationResponse,
    status_code=201,
    summary="Submit Aggregate Observation",
    description="Submit an authorized aggregate health observation. Privacy suppression is automatically applied for counts below threshold.",
    dependencies=[Depends(require_analyst)],
)
async def create_observation(payload: ObservationCreate):
    validated_obs, is_suppressed, eff_count = validation_service.validate_observation(
        payload, check_duplicate=True
    )
    return observation_repository.create(
        observation=validated_obs,
        is_suppressed=is_suppressed,
        effective_count=eff_count,
    )
