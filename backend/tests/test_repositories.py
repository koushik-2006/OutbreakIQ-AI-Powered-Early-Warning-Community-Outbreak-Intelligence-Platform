from datetime import date
from app.repositories.alert_repository import alert_repository
from app.repositories.investigation_repository import investigation_repository
from app.repositories.observation_repository import observation_repository
from app.repositories.region_repository import region_repository
from app.schemas.alert import AlertCreate
from app.schemas.observation import ObservationCreate
from app.schemas.region import RegionCreate
from app.utils.enums import ConfidenceLevel, SeverityLevel


def test_region_repository_crud():
    new_reg = RegionCreate(
        id="REG-TEST-01",
        name="Test County",
        code="TC-99",
        population=120000,
        latitude=41.0,
        longitude=-73.0,
    )
    created = region_repository.create(new_reg)
    assert created.id == "REG-TEST-01"

    fetched = region_repository.get_by_id("REG-TEST-01")
    assert fetched is not None
    assert fetched.name == "Test County"

    all_regions = region_repository.list_regions()
    assert any(r.id == "REG-TEST-01" for r in all_regions)


def test_observation_repository_crud():
    obs = ObservationCreate(
        region_id="REG-METRO-N",
        indicator="ILI",
        reporting_date=date(2025, 6, 1),
        count=42,
        source_id="SRC-TEST-REPO",
    )
    created = observation_repository.create(obs, is_suppressed=False, effective_count=42)
    assert created.id.startswith("OBS-")
    assert created.effective_count == 42

    exists = observation_repository.exists(
        region_id="REG-METRO-N",
        indicator="ILI",
        reporting_date=date(2025, 6, 1),
        source_id="SRC-TEST-REPO",
    )
    assert exists is True


def test_alert_repository_crud():
    alert_in = AlertCreate(
        region_id="REG-TEST-01",
        indicator="ILI",
        reporting_date=date.today(),
        observed_value=80,
        baseline_expected=35.0,
        deviation_score=3.1,
        severity=SeverityLevel.HIGH,
        confidence=ConfidenceLevel.HIGH,
        explanation="Test alert creation in repository.",
    )
    created = alert_repository.create(alert_in)
    assert created.id.startswith("ALT-")

    found = alert_repository.get_by_id(created.id)
    assert found is not None
    assert found.observed_value == 80


def test_investigation_repository_crud():
    all_invs, total = investigation_repository.list_all()
    assert total >= 1
    sample = all_invs[0]
    fetched = investigation_repository.get_by_id(sample.id)
    assert fetched is not None
    assert fetched.title == sample.title
