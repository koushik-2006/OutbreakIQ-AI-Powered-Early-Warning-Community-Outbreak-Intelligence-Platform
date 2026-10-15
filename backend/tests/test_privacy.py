import io
from datetime import date
import pytest
from app.core.exceptions import IdentifiableDataRejectedError
from app.schemas.observation import ObservationCreate
from app.services.validation_service import validation_service


def test_pii_rejection_in_model():
    """Verify that records with identifiable patient fields are strictly rejected."""
    with pytest.raises(IdentifiableDataRejectedError) as exc_info:
        ObservationCreate(
            region_id="REG-METRO-N",
            indicator="ILI",
            reporting_date=date.today(),
            count=25,
            source_id="SRC-01",
            patient_name="John Doe",  # Direct PII
        )
    assert "patient_name" in str(exc_info.value)


def test_pii_in_metadata_rejection():
    """Verify that nested PII within metadata dictionary is rejected."""
    with pytest.raises(IdentifiableDataRejectedError) as exc_info:
        ObservationCreate(
            region_id="REG-METRO-N",
            indicator="ILI",
            reporting_date=date.today(),
            count=25,
            source_id="SRC-01",
            metadata={"ssn": "123-45-6789"},
        )
    assert "ssn" in str(exc_info.value)


def test_privacy_suppression_for_small_counts():
    """Verify that counts below privacy threshold (e.g. 1 to 4) are suppressed."""
    is_suppressed, eff_count = validation_service.apply_privacy_suppression(count=3)
    assert is_suppressed is True
    assert eff_count is None

    # Zero count does not identify individual patients
    is_suppressed, eff_count = validation_service.apply_privacy_suppression(count=0)
    assert is_suppressed is False
    assert eff_count == 0

    # Count meeting or exceeding threshold is not suppressed
    is_suppressed, eff_count = validation_service.apply_privacy_suppression(count=5)
    assert is_suppressed is False
    assert eff_count == 5

    is_suppressed, eff_count = validation_service.apply_privacy_suppression(count=45)
    assert is_suppressed is False
    assert eff_count == 45


def test_csv_upload_rejects_pii_header():
    """Verify that uploaded CSV containing patient columns is blocked immediately."""
    csv_data = b"patient_name,region_id,indicator,reporting_date,count\nAlice,REG-METRO-N,ILI,2025-01-01,10\n"
    with pytest.raises(IdentifiableDataRejectedError):
        validation_service.validate_csv_content(csv_data, source_id="SRC-TEST")
