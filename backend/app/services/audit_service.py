import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from app.schemas.auth import AuditLogEntry, AuditLogFilter
from app.utils.enums import AuditAction


class AuditService:
    """Records and queries immutable audit events for sensitive public health actions."""

    def __init__(self):
        self._logs: List[dict] = []
        self._seed_sample_audit()

    def _seed_sample_audit(self):
        now = datetime.now(timezone.utc)
        self._logs.append(
            {
                "id": f"AUD-{uuid.uuid4().hex[:8]}",
                "timestamp": now,
                "action": AuditAction.ALERT_REVIEW,
                "actor_username": "dr_chen",
                "target_entity": "Alert",
                "target_id": "ALT-DOWNTOWN-002",
                "details": "Status changed to UNDER_INVESTIGATION",
                "ip_address": "127.0.0.1",
            }
        )

    def record_event(
        self,
        action: AuditAction,
        actor_username: str,
        target_entity: str,
        target_id: Optional[str] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> AuditLogEntry:
        """Create and persist an audit trail log entry."""
        entry = {
            "id": f"AUD-{uuid.uuid4().hex[:8]}",
            "timestamp": datetime.now(timezone.utc),
            "action": action,
            "actor_username": actor_username,
            "target_entity": target_entity,
            "target_id": target_id,
            "details": details,
            "ip_address": ip_address,
        }
        self._logs.append(entry)
        return AuditLogEntry(**entry)

    def query_logs(
        self,
        filters: AuditLogFilter,
        offset: int = 0,
        limit: int = 50,
    ) -> Tuple[List[AuditLogEntry], int]:
        """Query audit log entries with filters."""
        matched = []
        for log in self._logs:
            if filters.action and log["action"] != filters.action:
                continue
            if filters.actor_username and log["actor_username"] != filters.actor_username:
                continue
            if filters.target_entity and log["target_entity"] != filters.target_entity:
                continue
            matched.append(AuditLogEntry(**log))

        matched.sort(key=lambda x: x.timestamp, reverse=True)
        return matched[offset : offset + limit], len(matched)


audit_service = AuditService()
