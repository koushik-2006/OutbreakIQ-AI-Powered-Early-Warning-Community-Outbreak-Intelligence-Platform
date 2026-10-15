from typing import List, Optional, Tuple

from app.core.exceptions import EntityNotFoundError
from app.repositories.alert_repository import alert_repository
from app.repositories.investigation_repository import investigation_repository
from app.schemas.alert import AlertReviewUpdate
from app.schemas.investigation import (
    InvestigationCreate,
    InvestigationResponse,
    InvestigationUpdate,
)
from app.utils.enums import AlertReviewStatus, InvestigationStatus


class InvestigationService:
    """Manages public health case investigations linked to preliminary alerts."""

    def create_investigation_from_alert(
        self, data: InvestigationCreate, author_username: str
    ) -> InvestigationResponse:
        """Initiate an investigation case directly from an alert."""
        alert = alert_repository.get_by_id(data.alert_id)
        if not alert:
            raise EntityNotFoundError(entity="Alert", identifier=data.alert_id)

        # Update alert status to UNDER_INVESTIGATION automatically
        alert_repository.update_review(
            alert_id=data.alert_id,
            update=AlertReviewUpdate(
                review_status=AlertReviewStatus.UNDER_INVESTIGATION,
                review_notes=f"Investigation opened by {author_username}",
                assigned_to=data.assigned_to or author_username,
            ),
            reviewer_username=author_username,
        )

        # Create investigation
        inv = investigation_repository.create(
            data=data,
            region_id=alert.region_id,
            indicator=alert.indicator,
            author=author_username,
        )
        return inv

    def get_investigation(self, investigation_id: str) -> InvestigationResponse:
        """Retrieve investigation case by ID."""
        inv = investigation_repository.get_by_id(investigation_id)
        if not inv:
            raise EntityNotFoundError(entity="Investigation", identifier=investigation_id)
        return inv

    def update_investigation(
        self,
        investigation_id: str,
        update_data: InvestigationUpdate,
        author_username: str,
    ) -> InvestigationResponse:
        """Update investigation case status, outcome, or notes."""
        inv = investigation_repository.update(
            investigation_id=investigation_id,
            update_data=update_data,
            author=author_username,
        )
        if not inv:
            raise EntityNotFoundError(entity="Investigation", identifier=investigation_id)
        return inv

    def add_case_note(
        self, investigation_id: str, note_text: str, author_username: str
    ) -> InvestigationResponse:
        """Add an analyst note to case timeline."""
        inv = investigation_repository.add_note(
            investigation_id=investigation_id,
            note_text=note_text,
            author=author_username,
        )
        if not inv:
            raise EntityNotFoundError(entity="Investigation", identifier=investigation_id)
        return inv

    def list_investigations(
        self,
        status: Optional[InvestigationStatus] = None,
        offset: int = 0,
        limit: int = 50,
    ) -> Tuple[List[InvestigationResponse], int]:
        """List investigations with optional status filter."""
        return investigation_repository.list_all(status=status, offset=offset, limit=limit)


investigation_service = InvestigationService()
