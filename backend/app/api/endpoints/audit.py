from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.core.permissions import require_analyst
from app.schemas.auth import AuditLogEntry, AuditLogFilter
from app.services.audit_service import audit_service
from app.utils.enums import AuditAction
from app.utils.pagination import PaginatedResponse

router = APIRouter()


@router.get(
    "/logs",
    response_model=PaginatedResponse[AuditLogEntry],
    summary="Query Audit Logs",
    description="Retrieve immutable audit trails for sensitive surveillance actions (Analyst or higher).",
    dependencies=[Depends(require_analyst)],
)
async def list_audit_logs(
    action: Optional[AuditAction] = Query(None, description="Filter by action type"),
    actor_username: Optional[str] = Query(None, description="Filter by user"),
    target_entity: Optional[str] = Query(None, description="Filter by target entity"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
):
    filters = AuditLogFilter(
        action=action,
        actor_username=actor_username,
        target_entity=target_entity,
    )
    offset = (page - 1) * page_size
    items, total = audit_service.query_logs(filters=filters, offset=offset, limit=page_size)
    return PaginatedResponse.create(items=items, total=total, page=page, page_size=page_size)
