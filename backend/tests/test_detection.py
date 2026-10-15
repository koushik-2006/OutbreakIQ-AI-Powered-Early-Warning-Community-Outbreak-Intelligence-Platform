from datetime import date
from app.services.baseline_service import baseline_service
from app.services.detection_service import detection_service
from app.utils.enums import SeverityLevel


def test_baseline_calculation():
    """Verify that baseline calculation returns expected metrics from synthetic history."""
    baseline = baseline_service.calculate_baseline(
        region_id="REG-METRO-N",
        indicator="ILI",
        target_date=date.today(),
        window_days=28,
    )
    assert baseline.usable_observations_count > 0
    assert baseline.has_sufficient_history is True
    assert baseline.expected_value > 0
    assert baseline.historical_variability >= 0


def test_anomaly_detection_engine():
    """Verify anomaly detection correctly flags elevated signal in synthetic dataset."""
    result = detection_service.detect_anomaly(
        region_id="REG-METRO-N",
        indicator="ILI",
        target_date=date.today(),
    )
    # REG-METRO-N ILI was seeded with recent surge count (98) against ~45 baseline
    assert result.is_anomaly is True
    assert result.deviation_score > 2.0
    assert result.severity_assessment in (SeverityLevel.HIGH, SeverityLevel.CRITICAL)
    assert "Statistically unusual signal" in result.explanation


def test_nominal_activity_detection():
    """Verify normal baseline variations are not flagged as anomalies."""
    result = detection_service.detect_anomaly(
        region_id="REG-EAST-SUB",
        indicator="ILI",
        target_date=date.today(),
    )
    assert result.is_anomaly is False
    assert result.severity_assessment == SeverityLevel.LOW
