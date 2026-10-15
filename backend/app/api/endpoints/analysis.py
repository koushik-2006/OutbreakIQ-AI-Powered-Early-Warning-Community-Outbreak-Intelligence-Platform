from datetime import date
from typing import Optional
from fastapi import APIRouter, Query

from app.schemas.analysis import (
    AnomalyAnalysisRequest,
    AnomalyAnalysisResult,
    BaselineResult,
)
from app.services.baseline_service import baseline_service
from app.services.detection_service import detection_service

router = APIRouter()


@router.post(
    "/run",
    response_model=AnomalyAnalysisResult,
    summary="Execute Anomaly Detection",
    description="Run the statistical anomaly detection engine on a specific region and indicator. An anomaly represents statistical deviation, not proof of an outbreak.",
)
async def run_detection(payload: AnomalyAnalysisRequest):
    return detection_service.detect_anomaly(
        region_id=payload.region_id,
        indicator=payload.indicator,
        target_date=payload.target_date,
        historical_window_days=payload.historical_window_days,
        sensitivity_threshold=payload.sensitivity_threshold,
    )


@router.get(
    "/baseline",
    response_model=BaselineResult,
    summary="Compute Expected Baseline",
    description="Calculate historical expected activity, variability, and data sufficiency for a region and indicator.",
)
async def get_baseline(
    region_id: str = Query(..., description="Target region ID"),
    indicator: str = Query(..., description="Target surveillance indicator"),
    target_date: Optional[date] = Query(None, description="Reference date (defaults to today)"),
    window_days: int = Query(28, ge=7, le=90, description="Rolling historical window in days"),
):
    return baseline_service.calculate_baseline(
        region_id=region_id,
        indicator=indicator,
        target_date=target_date,
        window_days=window_days,
    )
