from datetime import date
from typing import List, Optional, Tuple

from app.core.config import settings
from app.core.exceptions import DuplicateAlertError, EntityNotFoundError
from app.repositories.alert_repository import alert_repository
from app.repositories.region_repository import region_repository
from app.schemas.alert import (
    AlertCreate,
    AlertFilter,
    AlertResponse,
    AlertReviewUpdate,
)
from app.schemas.analysis import AnomalyAnalysisResult
from app.services.corroboration_service import corroboration_service
from app.services.detection_service import detection_service
from app.services.explanation_service import explanation_service
from app.utils.enums import AlertReviewStatus


class AlertService:
    """Orchestrates detection, corroboration, explanation, and alert persistence."""

    def __init__(self):
        self.cooldown_hours = settings.DUPLICATE_ALERT_COOLDOWN_HOURS

    def evaluate_and_create_alert(
        self,
        region_id: str,
        indicator: str,
        target_date: Optional[date] = None,
        force_create: bool = False,
    ) -> Optional[AlertResponse]:
        """Runs detection on a region/indicator. If an anomaly is identified,
        verifies cooldown window to prevent duplicates, generates explanation & corroboration,
        persists the alert, and updates regional counters.
        """
        ref_date = target_date or date.today()

        # 1. Run detection
        analysis: AnomalyAnalysisResult = detection_service.detect_anomaly(
            region_id=region_id,
            indicator=indicator,
            target_date=ref_date,
        )

        if not analysis.is_anomaly and not force_create:
            return None

        # 2. Check for duplicate alert within cooldown window
        existing_alert = alert_repository.find_recent_alert(
            region_id=region_id,
            indicator=indicator,
            cooldown_hours=self.cooldown_hours,
        )
        if existing_alert and not force_create:
            raise DuplicateAlertError(
                region_id=region_id,
                indicator=indicator,
                cooldown_hours=self.cooldown_hours,
            )

        # 3. Check corroboration
        corroboration_signals, corrob_summary = corroboration_service.evaluate_corroboration(
            region_id=region_id,
            primary_indicator=indicator,
            target_date=ref_date,
        )

        # 4. Build comprehensive explanation
        region = region_repository.get_by_id(region_id)
        region_name = region.name if region else region_id

        explanation = explanation_service.build_alert_explanation(
            analysis=analysis,
            corroboration_evidence=corroboration_signals,
            data_quality_notes="Primary surveillance feed active and validated.",
        )

        # 5. Build AlertCreate payload
        alert_in = AlertCreate(
            region_id=region_id,
            region_name=region_name,
            indicator=indicator,
            reporting_date=ref_date,
            observed_value=analysis.observed_value,
            baseline_expected=analysis.baseline_expected,
            deviation_score=analysis.deviation_score,
            severity=analysis.severity_assessment,
            confidence=analysis.confidence,
            explanation=explanation,
            evidence_summary=corrob_summary,
            corroborating_signals=corroboration_signals,
            data_quality_notes="Automated surveillance engine check: nominal feed reliability.",
        )

        # 6. Persist through repository
        created_alert = alert_repository.create(alert_in)

        # 7. Update region active alert tally
        region_repository.update_alert_count(region_id, delta=1)

        return created_alert

    def get_alert_by_id(self, alert_id: str) -> AlertResponse:
        """Fetch alert by ID or raise EntityNotFoundError."""
        alert = alert_repository.get_by_id(alert_id)
        if not alert:
            raise EntityNotFoundError(entity="Alert", identifier=alert_id)
        return alert

    def update_alert_review(
        self, alert_id: str, update: AlertReviewUpdate, reviewer_username: str
    ) -> AlertResponse:
        """Update review status of an alert and adjust regional active counts if dismissed."""
        existing = self.get_alert_by_id(alert_id)
        updated = alert_repository.update_review(
            alert_id=alert_id,
            update=update,
            reviewer_username=reviewer_username,
        )
        if not updated:
            raise EntityNotFoundError(entity="Alert", identifier=alert_id)

        # If alert was dismissed or confirmed, decrease active count if transitioning from PENDING
        if (
            existing.review_status == AlertReviewStatus.PENDING_REVIEW
            and update.review_status in (AlertReviewStatus.DISMISSED, AlertReviewStatus.CONFIRMED)
        ):
            region_repository.update_alert_count(existing.region_id, delta=-1)

        return updated

    def query_alerts(
        self, filters: AlertFilter, offset: int = 0, limit: int = 50
    ) -> Tuple[List[AlertResponse], int]:
        """Query alerts with filters and pagination."""
        return alert_repository.query(filters=filters, offset=offset, limit=limit)


alert_service = AlertService()
