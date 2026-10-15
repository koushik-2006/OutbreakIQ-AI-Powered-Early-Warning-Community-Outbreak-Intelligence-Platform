from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.core.permissions import AuthenticatedUser, require_analyst, require_epidemiologist
from app.schemas.alert import (
    AlertFilter,
    AlertResponse,
    AlertReviewUpdate,
)
from app.services.alert_service import alert_service
from app.services.audit_service import audit_service
from app.utils.enums import AlertReviewStatus, AuditAction, SeverityLevel
from app.utils.pagination import PaginatedResponse

router = APIRouter()


@router.get(
    "",
    response_model=PaginatedResponse[AlertResponse],
    summary="List Preliminary Alerts",
    description="Retrieve explainable surveillance alerts with filters for severity, review status, indicator, and region.",
)
async def list_alerts(
    region_id: Optional[str] = Query(None, description="Filter by region ID"),
    indicator: Optional[str] = Query(None, description="Filter by indicator"),
    severity: Optional[SeverityLevel] = Query(None, description="Filter by severity level"),
    review_status: Optional[AlertReviewStatus] = Query(None, description="Filter by review status"),
    start_date: Optional[date] = Query(None, description="Earliest reporting date"),
    end_date: Optional[date] = Query(None, description="Latest reporting date"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    filters = AlertFilter(
        region_id=region_id,
        indicator=indicator,
        severity=severity,
        review_status=review_status,
        start_date=start_date,
        end_date=end_date,
    )
    offset = (page - 1) * page_size
    items, total = alert_service.query_alerts(filters=filters, offset=offset, limit=page_size)
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)


@router.get(
    "/{id}",
    response_model=AlertResponse,
    summary="Get Alert Details",
    description="Retrieve full details for an alert, including baseline comparison, explanation, and corroborating signals.",
)
async def get_alert(id: str):
    return alert_service.get_alert_by_id(id)


@router.post(
    "/evaluate",
    response_model=Optional[AlertResponse],
    summary="Evaluate & Trigger Alert",
    description="Trigger surveillance analysis for a region/indicator. If an unusual signal is detected and not in cooldown, an explainable alert is generated.",
    dependencies=[Depends(require_analyst)],
)
async def evaluate_alert(
    region_id: str = Query(..., description="Target region ID"),
    indicator: str = Query(..., description="Target surveillance indicator"),
    target_date: Optional[date] = Query(None, description="Reference observation date"),
    force: bool = Query(False, description="Bypass cooldown check if true"),
):
    return alert_service.evaluate_and_create_alert(
        region_id=region_id,
        indicator=indicator,
        target_date=target_date,
        force_create=force,
    )


@router.patch(
    "/{id}/review",
    response_model=AlertResponse,
    summary="Update Alert Review Status",
    description="Triage or update review status of an alert (Epidemiologist or Analyst only).",
)
async def review_alert(
    id: str,
    payload: AlertReviewUpdate,
    current_user: AuthenticatedUser = Depends(require_epidemiologist),
):
    updated = alert_service.update_alert_review(
        alert_id=id,
        update=payload,
        reviewer_username=current_user.username,
    )
    audit_service.record_event(
        action=AuditAction.ALERT_REVIEW,
        actor_username=current_user.username,
        target_entity="Alert",
        target_id=id,
        details=f"Alert review updated to {payload.review_status.value}. Notes: {payload.review_notes or 'None'}",
    )
    return updated
