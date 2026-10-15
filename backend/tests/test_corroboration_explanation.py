from datetime import date
from app.schemas.alert import CorroborationEvidence
from app.schemas.analysis import AnomalyAnalysisResult
from app.services.corroboration_service import corroboration_service
from app.services.explanation_service import explanation_service
from app.utils.enums import ConfidenceLevel, SeverityLevel


def test_corroboration_service_evaluation():
    # Corroborate ILI in Metro North
    evidence, summary = corroboration_service.evaluate_corroboration(
        region_id="REG-METRO-N",
        primary_indicator="ILI",
        target_date=date.today(),
    )
    assert isinstance(evidence, list)
    assert isinstance(summary, str)


def test_explanation_generation_clarity():
    analysis = AnomalyAnalysisResult(
        region_id="REG-METRO-N",
        indicator="ILI",
        target_date=date.today(),
        observed_value=95,
        baseline_expected=45.0,
        deviation_score=3.25,
        is_anomaly=True,
        severity_assessment=SeverityLevel.HIGH,
        confidence=ConfidenceLevel.HIGH,
        insufficient_history=False,
        small_count_flag=False,
        explanation="",
    )

    corrob_evidence = [
        CorroborationEvidence(
            indicator="OTC_COUGH_COLD",
            source_name="SRC-PHARM-01",
            observed_trend="+30% sales surge",
            signal_strength="STRONG",
            consistent_with_primary=True,
        )
    ]

    explanation = explanation_service.build_alert_explanation(
        analysis=analysis,
        corroboration_evidence=corrob_evidence,
        data_quality_notes="Nominal feed reliability",
    )

    # Verify explainability elements
    assert "95" in explanation
    assert "45.0" in explanation
    assert "3.25" in explanation
    assert "OTC_COUGH_COLD" in explanation
    assert "Preliminary alert" in explanation
    assert "Requires epidemiologist verification" in explanation
