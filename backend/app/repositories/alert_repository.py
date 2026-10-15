import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.schemas.alert import (
    AlertCreate,
    AlertFilter,
    AlertResponse,
    AlertReviewUpdate,
)
from app.utils.enums import AlertReviewStatus, ConfidenceLevel, SeverityLevel


class AlertRepository:
    """Repository managing explainable preliminary alerts."""

    def __init__(self):
        self._alerts: Dict[str, dict] = {}
        self._seed_initial_alerts()

    def _seed_initial_alerts(self):
        """Seed initial alerts for demonstration and frontend testing."""
        now = datetime.now(timezone.utc)
        today = date.today()

        alert_1_id = "ALT-METRO-N-001"
        self._alerts[alert_1_id] = {
            "id": alert_1_id,
            "region_id": "REG-METRO-N",
            "region_name": "Metro North District",
            "indicator": "ILI",
            "reporting_date": today,
            "observed_value": 98,
            "baseline_expected": 45.2,
            "deviation_score": 3.42,
            "severity": SeverityLevel.HIGH,
            "confidence": ConfidenceLevel.HIGH,
            "explanation": "Observed aggregate ILI count (98) exceeds 28-day rolling baseline (45.2 ± 15.4) by 3.42 standard deviations. Signal is corroborated by a 35% surge in OTC cough/cold remedy transactions across local retail pharmacies.",
            "evidence_summary": "Primary signal: Syndromic ILI visits elevated for 2 consecutive reporting intervals.",
            "corroborating_signals": [
                {
                    "indicator": "OTC_COUGH_COLD",
                    "source_name": "Metro Pharmacy Surveillance",
                    "observed_trend": "+35% week-over-week increase",
                    "signal_strength": "STRONG",
                    "consistent_with_primary": True,
                }
            ],
            "data_quality_notes": "Data freshness: updated 2 hours ago. 100% reporting facilities reporting.",
            "review_status": AlertReviewStatus.PENDING_REVIEW,
            "reviewed_by": None,
            "reviewed_at": None,
            "review_notes": None,
            "created_at": now - timedelta(hours=3),
            "updated_at": now - timedelta(hours=3),
        }

        alert_2_id = "ALT-DOWNTOWN-002"
        self._alerts[alert_2_id] = {
            "id": alert_2_id,
            "region_id": "REG-DOWNTOWN",
            "region_name": "Downtown Central",
            "indicator": "RESPIRATORY_CLINIC",
            "reporting_date": today - timedelta(days=1),
            "observed_value": 72,
            "baseline_expected": 41.0,
            "deviation_score": 2.65,
            "severity": SeverityLevel.MEDIUM,
            "confidence": ConfidenceLevel.MEDIUM,
            "explanation": "Respiratory outpatient visits (72) elevated 2.65 standard deviations above 28-day rolling average (41.0).",
            "evidence_summary": "Unusual mid-week cluster in commercial core.",
            "corroborating_signals": [],
            "data_quality_notes": "All ambulatory sentinel feeds operating nominally.",
            "review_status": AlertReviewStatus.UNDER_INVESTIGATION,
            "reviewed_by": "dr_chen",
            "reviewed_at": now - timedelta(hours=14),
            "review_notes": "Triage started; checking school district attendance data.",
            "created_at": now - timedelta(days=1),
            "updated_at": now - timedelta(hours=14),
        }

    def create(self, alert: AlertCreate, db: Optional[Session] = None) -> AlertResponse:
        """Create and persist a preliminary alert."""
        alert_id = f"ALT-{uuid.uuid4().hex[:10].upper()}"
        now = datetime.now(timezone.utc)
        record = alert.model_dump()
        record.update(
            {
                "id": alert_id,
                "review_status": AlertReviewStatus.PENDING_REVIEW,
                "reviewed_by": None,
                "reviewed_at": None,
                "review_notes": None,
                "created_at": now,
                "updated_at": now,
            }
        )
        self._alerts[alert_id] = record
        return AlertResponse(**record)

    def get_by_id(self, alert_id: str, db: Optional[Session] = None) -> Optional[AlertResponse]:
        """Fetch alert by unique ID."""
        data = self._alerts.get(alert_id)
        if data:
            return AlertResponse(**data)
        return None

    def find_recent_alert(
        self,
        region_id: str,
        indicator: str,
        cooldown_hours: int = 24,
        db: Optional[Session] = None,
    ) -> Optional[AlertResponse]:
        """Find recent alert for the same region and indicator within cooldown hours to prevent spam."""
        now = datetime.now(timezone.utc)
        threshold_time = now - timedelta(hours=cooldown_hours)

        for item in self._alerts.values():
            if (
                item["region_id"] == region_id
                and item["indicator"] == indicator
                and item["created_at"] >= threshold_time
                and item["review_status"] != AlertReviewStatus.DISMISSED
            ):
                return AlertResponse(**item)
        return None

    def update_review(
        self,
        alert_id: str,
        update: AlertReviewUpdate,
        reviewer_username: str,
        db: Optional[Session] = None,
    ) -> Optional[AlertResponse]:
        """Update review state, notes, and reviewer."""
        if alert_id not in self._alerts:
            return None

        record = self._alerts[alert_id]
        now = datetime.now(timezone.utc)
        record["review_status"] = update.review_status
        record["reviewed_by"] = update.assigned_to or reviewer_username
        record["reviewed_at"] = now
        record["updated_at"] = now
        if update.review_notes:
            record["review_notes"] = update.review_notes

        return AlertResponse(**record)

    def query(
        self,
        filters: AlertFilter,
        offset: int = 0,
        limit: int = 50,
        db: Optional[Session] = None,
    ) -> Tuple[List[AlertResponse], int]:
        """Query alerts with criteria filters and pagination."""
        matched = []
        for item in self._alerts.values():
            if filters.region_id and item["region_id"] != filters.region_id:
                continue
            if filters.indicator and item["indicator"] != filters.indicator:
                continue
            if filters.severity and item["severity"] != filters.severity:
                continue
            if filters.review_status and item["review_status"] != filters.review_status:
                continue
            if filters.start_date and item["reporting_date"] < filters.start_date:
                continue
            if filters.end_date and item["reporting_date"] > filters.end_date:
                continue
            matched.append(AlertResponse(**item))

        matched.sort(key=lambda x: x.created_at, reverse=True)
        total = len(matched)
        return matched[offset : offset + limit], total


alert_repository = AlertRepository()
