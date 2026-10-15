from datetime import date, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query

from app.core.exceptions import EntityNotFoundError
from app.core.permissions import require_admin
from app.repositories.alert_repository import alert_repository
from app.repositories.observation_repository import observation_repository
from app.repositories.region_repository import region_repository
from app.schemas.alert import AlertFilter, AlertResponse
from app.schemas.region import (
    RegionCreate,
    RegionResponse,
    RegionTrendPoint,
    RegionTrendsResponse,
)
from app.services.baseline_service import baseline_service

router = APIRouter()


@router.get(
    "",
    response_model=List[RegionResponse],
    summary="List Surveillance Regions",
    description="Retrieve all registered geographic surveillance regions with active alert counts.",
)
async def list_regions():
    return region_repository.list_regions()


@router.get(
    "/{id}",
    response_model=RegionResponse,
    summary="Get Region Details",
    description="Retrieve a single region by unique ID.",
)
async def get_region(id: str):
    reg = region_repository.get_by_id(id)
    if not reg:
        raise EntityNotFoundError(entity="Region", identifier=id)
    return reg


@router.get(
    "/{id}/trends",
    response_model=RegionTrendsResponse,
    summary="Regional Trends & Deviations",
    description="Retrieve chronological observation counts against baseline expectations for a region.",
)
async def get_region_trends(
    id: str,
    indicator: str = Query("ILI", description="Target health indicator"),
    days: int = Query(14, ge=7, le=60, description="Trend window in days"),
):
    reg = region_repository.get_by_id(id)
    if not reg:
        raise EntityNotFoundError(entity="Region", identifier=id)

    today = date.today()
    start_date = today - timedelta(days=days)

    historical_obs = observation_repository.get_historical(
        region_id=id,
        indicator=indicator,
        start_date=start_date,
        end_date=today,
    )

    baseline = baseline_service.calculate_baseline(
        region_id=id,
        indicator=indicator,
        target_date=today,
        window_days=28,
    )

    trend_points: List[RegionTrendPoint] = []
    variability = max(baseline.historical_variability, 1.0)

    for obs in historical_obs:
        count = obs.effective_count or 0
        diff = count - baseline.expected_value
        z = diff / variability
        trend_points.append(
            RegionTrendPoint(
                reporting_date=obs.reporting_date,
                indicator=indicator,
                observed_count=count,
                baseline_expected=baseline.expected_value,
                deviation_score=round(z, 2),
                is_anomaly=z >= 2.0,
            )
        )

    return RegionTrendsResponse(
        region_id=id,
        region_name=reg.name,
        start_date=start_date,
        end_date=today,
        trends=trend_points,
    )


@router.get(
    "/{id}/alerts",
    response_model=List[AlertResponse],
    summary="List Regional Alerts",
    description="Retrieve alerts associated with the specified region.",
)
async def get_region_alerts(
    id: str,
    limit: int = Query(20, ge=1, le=100),
):
    reg = region_repository.get_by_id(id)
    if not reg:
        raise EntityNotFoundError(entity="Region", identifier=id)

    alerts, _ = alert_repository.query(
        filters=AlertFilter(region_id=id),
        offset=0,
        limit=limit,
    )
    return alerts


@router.post(
    "",
    response_model=RegionResponse,
    status_code=201,
    summary="Register Region",
    description="Register a new geographic surveillance region (Admin only).",
    dependencies=[Depends(require_admin)],
)
async def create_region(payload: RegionCreate):
    return region_repository.create(payload)
