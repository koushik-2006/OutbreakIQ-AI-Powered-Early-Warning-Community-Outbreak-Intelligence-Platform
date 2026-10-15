from datetime import date
import pytest
from app.core.exceptions import DuplicateAlertError
from app.schemas.alert import AlertFilter, AlertReviewUpdate
from app.services.alert_service import alert_service
from app.utils.enums import AlertReviewStatus


def test_alert_query_and_filtering():
    """Verify that alerts can be queried and filtered."""
    alerts, total = alert_service.query_alerts(filters=AlertFilter(), offset=0, limit=10)
    assert total >= 2
    assert len(alerts) <= 10


def test_alert_review_workflow():
    """Verify triage state updates on alerts."""
    alerts, _ = alert_service.query_alerts(filters=AlertFilter())
    target_alert = alerts[0]

    update_payload = AlertReviewUpdate(
        review_status=AlertReviewStatus.UNDER_INVESTIGATION,
        review_notes="Initiating cross-jurisdiction data check",
        assigned_to="dr_chen",
    )

    updated = alert_service.update_alert_review(
        alert_id=target_alert.id,
        update=update_payload,
        reviewer_username="dr_chen",
    )

    assert updated.review_status == AlertReviewStatus.UNDER_INVESTIGATION
    assert updated.reviewed_by == "dr_chen"
    assert updated.review_notes == "Initiating cross-jurisdiction data check"


def test_duplicate_alert_cooldown():
    """Verify that multiple alert triggers within cooldown window raise DuplicateAlertError."""
    # Attempting to trigger an alert where one recently exists should raise DuplicateAlertError
    with pytest.raises(DuplicateAlertError):
        alert_service.evaluate_and_create_alert(
            region_id="REG-METRO-N",
            indicator="ILI",
            target_date=date.today(),
            force_create=False,
        )
