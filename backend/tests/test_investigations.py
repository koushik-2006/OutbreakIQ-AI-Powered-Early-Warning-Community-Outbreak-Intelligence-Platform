from app.schemas.investigation import (
    InvestigationCreate,
    InvestigationUpdate,
)
from app.services.alert_service import alert_service
from app.services.investigation_service import investigation_service
from app.utils.enums import (
    AlertReviewStatus,
    InvestigationOutcome,
    InvestigationStatus,
)


def test_create_investigation_from_alert():
    """Verify that opening an investigation transitions the linked alert to UNDER_INVESTIGATION."""
    # Seeded alert ALT-METRO-N-001
    alert_id = "ALT-METRO-N-001"

    inv_in = InvestigationCreate(
        alert_id=alert_id,
        title="Metro North Spike Epidemiological Review",
        initial_notes="Investigating high ILI deviation corroborated by OTC sales.",
        assigned_to="dr_chen",
    )

    inv = investigation_service.create_investigation_from_alert(
        data=inv_in, author_username="dr_chen"
    )

    assert inv.id.startswith("INV-")
    assert inv.alert_id == alert_id
    assert inv.status == InvestigationStatus.OPEN
    assert len(inv.timeline) >= 1

    # Check that alert status was updated
    linked_alert = alert_service.get_alert_by_id(alert_id)
    assert linked_alert.review_status == AlertReviewStatus.UNDER_INVESTIGATION


def test_investigation_case_workflow():
    """Verify state transitions and note appending on investigation cases."""
    # Seeded investigation INV-2025-001
    inv_id = "INV-2025-001"

    # Add case note
    inv_with_note = investigation_service.add_case_note(
        investigation_id=inv_id,
        note_text="Lab samples confirmed positive for Influenza A (H3N2).",
        author_username="dr_chen",
    )
    assert any("Influenza A" in item.details for item in inv_with_note.timeline)

    # Update status and outcome
    updated = investigation_service.update_investigation(
        investigation_id=inv_id,
        update_data=InvestigationUpdate(
            status=InvestigationStatus.RESOLVED,
            outcome=InvestigationOutcome.LOCALIZED_CLUSTER,
            resolution_summary="Seasonal cluster managed with local clinic surge protocols.",
        ),
        author_username="dr_chen",
    )

    assert updated.status == InvestigationStatus.RESOLVED
    assert updated.outcome == InvestigationOutcome.LOCALIZED_CLUSTER
    assert "Seasonal cluster" in updated.resolution_summary
