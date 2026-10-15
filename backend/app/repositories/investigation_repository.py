import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.schemas.investigation import (
    InvestigationCreate,
    InvestigationResponse,
    InvestigationTimelineItem,
    InvestigationUpdate,
)
from app.utils.enums import InvestigationOutcome, InvestigationStatus


class InvestigationRepository:
    """Repository managing outbreak investigation workflows and chronological timeline."""

    def __init__(self):
        self._investigations: Dict[str, dict] = {}
        self._seed_initial_investigation()

    def _seed_initial_investigation(self):
        """Seed initial investigation for demonstration."""
        now = datetime.now(timezone.utc)
        inv_id = "INV-2025-001"
        self._investigations[inv_id] = {
            "id": inv_id,
            "alert_id": "ALT-DOWNTOWN-002",
            "title": "Downtown Clinic Respiratory Surge Investigation",
            "region_id": "REG-DOWNTOWN",
            "indicator": "RESPIRATORY_CLINIC",
            "status": InvestigationStatus.IN_PROGRESS,
            "outcome": InvestigationOutcome.UNDER_EVALUATION,
            "assigned_to": "dr_chen",
            "created_by": "dr_chen",
            "resolution_summary": None,
            "timeline": [
                {
                    "timestamp": now - timedelta(hours=14),
                    "author": "dr_chen",
                    "action": "INVESTIGATION_OPENED",
                    "details": "Triggered from alert ALT-DOWNTOWN-002: Respiratory visits exceeding expected baseline.",
                },
                {
                    "timestamp": now - timedelta(hours=8),
                    "author": "dr_chen",
                    "action": "NOTE_ADDED",
                    "details": "Contacted sentinel clinic coordinator; checking if flu season or event cluster.",
                },
            ],
            "created_at": now - timedelta(hours=14),
            "updated_at": now - timedelta(hours=8),
        }

    def create(
        self,
        data: InvestigationCreate,
        region_id: str,
        indicator: str,
        author: str,
        db: Optional[Session] = None,
    ) -> InvestigationResponse:
        """Create a new investigation case from an alert."""
        inv_id = f"INV-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc)

        timeline = [
            InvestigationTimelineItem(
                timestamp=now,
                author=author,
                action="INVESTIGATION_OPENED",
                details=data.initial_notes or f"Investigation initiated from Alert {data.alert_id}.",
            )
        ]

        record = {
            "id": inv_id,
            "alert_id": data.alert_id,
            "title": data.title,
            "region_id": region_id,
            "indicator": indicator,
            "status": InvestigationStatus.OPEN,
            "outcome": InvestigationOutcome.UNDER_EVALUATION,
            "assigned_to": data.assigned_to or author,
            "created_by": author,
            "resolution_summary": None,
            "timeline": [item.model_dump() for item in timeline],
            "created_at": now,
            "updated_at": now,
        }
        self._investigations[inv_id] = record
        return InvestigationResponse(**record)

    def get_by_id(self, investigation_id: str, db: Optional[Session] = None) -> Optional[InvestigationResponse]:
        """Fetch investigation case by ID."""
        data = self._investigations.get(investigation_id)
        if data:
            return InvestigationResponse(**data)
        return None

    def update(
        self,
        investigation_id: str,
        update_data: InvestigationUpdate,
        author: str,
        db: Optional[Session] = None,
    ) -> Optional[InvestigationResponse]:
        """Update investigation status, outcome, assignment, or resolution."""
        if investigation_id not in self._investigations:
            return None

        record = self._investigations[investigation_id]
        now = datetime.now(timezone.utc)

        changes = []
        if update_data.status and update_data.status != record["status"]:
            changes.append(f"Status changed to {update_data.status.value}")
            record["status"] = update_data.status

        if update_data.outcome and update_data.outcome != record["outcome"]:
            changes.append(f"Outcome set to {update_data.outcome.value}")
            record["outcome"] = update_data.outcome

        if update_data.assigned_to and update_data.assigned_to != record["assigned_to"]:
            changes.append(f"Assigned to {update_data.assigned_to}")
            record["assigned_to"] = update_data.assigned_to

        if update_data.resolution_summary:
            changes.append("Resolution summary updated")
            record["resolution_summary"] = update_data.resolution_summary

        if changes:
            record["timeline"].append(
                {
                    "timestamp": now,
                    "author": author,
                    "action": "INVESTIGATION_UPDATED",
                    "details": "; ".join(changes),
                }
            )

        record["updated_at"] = now
        return InvestigationResponse(**record)

    def add_note(
        self,
        investigation_id: str,
        note_text: str,
        author: str,
        db: Optional[Session] = None,
    ) -> Optional[InvestigationResponse]:
        """Append an analyst note to the case timeline."""
        if investigation_id not in self._investigations:
            return None

        record = self._investigations[investigation_id]
        now = datetime.now(timezone.utc)

        record["timeline"].append(
            {
                "timestamp": now,
                "author": author,
                "action": "NOTE_ADDED",
                "details": note_text,
            }
        )
        record["updated_at"] = now
        return InvestigationResponse(**record)

    def list_all(
        self,
        status: Optional[InvestigationStatus] = None,
        offset: int = 0,
        limit: int = 50,
        db: Optional[Session] = None,
    ) -> Tuple[List[InvestigationResponse], int]:
        """List investigations with optional status filter."""
        items = list(self._investigations.values())
        if status:
            items = [item for item in items if item["status"] == status]

        items.sort(key=lambda x: x["updated_at"], reverse=True)
        total = len(items)
        paginated = [InvestigationResponse(**x) for x in items[offset : offset + limit]]
        return paginated, total


investigation_repository = InvestigationRepository()
