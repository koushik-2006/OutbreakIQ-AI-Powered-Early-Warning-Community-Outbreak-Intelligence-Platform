from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.core.permissions import AuthenticatedUser, require_analyst, require_epidemiologist
from app.schemas.investigation import (
    InvestigationCreate,
    InvestigationNoteCreate,
    InvestigationResponse,
    InvestigationUpdate,
)
from app.services.audit_service import audit_service
from app.services.investigation_service import investigation_service
from app.utils.enums import AuditAction, InvestigationStatus
from app.utils.pagination import PaginatedResponse

router = APIRouter()


@router.post(
    "",
    response_model=InvestigationResponse,
    status_code=201,
    summary="Open Case Investigation",
    description="Initiate a public health investigation from an alert. Changes the linked alert's review status to UNDER_INVESTIGATION.",
)
async def create_investigation(
    payload: InvestigationCreate,
    current_user: AuthenticatedUser = Depends(require_epidemiologist),
):
    inv = investigation_service.create_investigation_from_alert(
        data=payload,
        author_username=current_user.username,
    )
    audit_service.record_event(
        action=AuditAction.INVESTIGATION_CREATE,
        actor_username=current_user.username,
        target_entity="Investigation",
        target_id=inv.id,
        details=f"Investigation created for alert {payload.alert_id}: {payload.title}",
    )
    return inv


@router.get(
    "",
    response_model=PaginatedResponse[InvestigationResponse],
    summary="List Investigations",
    description="Retrieve case investigations with optional status filter.",
)
async def list_investigations(
    status: Optional[InvestigationStatus] = Query(None, description="Filter by status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    offset = (page - 1) * page_size
    items, total = investigation_service.list_investigations(
        status=status, offset=offset, limit=page_size
    )
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)


@router.get(
    "/{id}",
    response_model=InvestigationResponse,
    summary="Get Investigation Details",
    description="Retrieve investigation case details and chronological timeline.",
)
async def get_investigation(id: str):
    return investigation_service.get_investigation(id)


@router.patch(
    "/{id}",
    response_model=InvestigationResponse,
    summary="Update Investigation Case",
    description="Update status, outcome classification, reviewer assignment, or resolution summary.",
)
async def update_investigation(
    id: str,
    payload: InvestigationUpdate,
    current_user: AuthenticatedUser = Depends(require_epidemiologist),
):
    updated = investigation_service.update_investigation(
        investigation_id=id,
        update_data=payload,
        author_username=current_user.username,
    )
    audit_service.record_event(
        action=AuditAction.INVESTIGATION_UPDATE,
        actor_username=current_user.username,
        target_entity="Investigation",
        target_id=id,
        details=f"Updated status={payload.status}, outcome={payload.outcome}",
    )
    return updated


@router.post(
    "/{id}/notes",
    response_model=InvestigationResponse,
    summary="Add Investigation Case Note",
    description="Append an epidemiological triage note to the case history.",
)
async def add_investigation_note(
    id: str,
    payload: InvestigationNoteCreate,
    current_user: AuthenticatedUser = Depends(require_analyst),
):
    updated = investigation_service.add_case_note(
        investigation_id=id,
        note_text=payload.note,
        author_username=current_user.username,
    )
    return updated
