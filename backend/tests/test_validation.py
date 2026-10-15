from datetime import date, timedelta
import pytest
from app.core.exceptions import DataValidationError
from app.schemas.observation import ObservationCreate
from app.services.validation_service import validation_service


def test_reject_future_date():
    future_date = date.today() + timedelta(days=5)
    obs = ObservationCreate(
        region_id="REG-METRO-N",
        indicator="ILI",
        reporting_date=future_date,
        count=15,
        source_id="SRC-TEST",
    )
    with pytest.raises(DataValidationError) as exc:
        validation_service.validate_observation(obs)
    assert "future" in str(exc.value)


def test_reject_invalid_region():
    obs = ObservationCreate(
        region_id="NON-EXISTENT-REGION-999",
        indicator="ILI",
        reporting_date=date.today(),
        count=15,
        source_id="SRC-TEST",
    )
    with pytest.raises(DataValidationError) as exc:
        validation_service.validate_observation(obs)
    assert "Invalid region reference" in str(exc.value)


def test_valid_csv_parsing():
    csv_bytes = (
        b"region_id,indicator,reporting_date,count\n"
        b"REG-METRO-N,ILI,2025-01-01,25\n"
        b"REG-METRO-S,RESPIRATORY_CLINIC,2025-01-01,3\n"  # should be suppressed (<5)
    )
    records = validation_service.validate_csv_content(csv_bytes, source_id="SRC-CSV")
    assert len(records) == 2

    # First record: count 25, not suppressed
    obs1, is_supp1, eff1 = records[0]
    assert is_supp1 is False
    assert eff1 == 25

    # Second record: count 3, suppressed
    obs2, is_supp2, eff2 = records[1]
    assert is_supp2 is True
    assert eff2 is None
