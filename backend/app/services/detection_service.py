import math
from datetime import date
from typing import Optional

from app.core.config import settings
from app.repositories.observation_repository import observation_repository
from app.schemas.analysis import AnomalyAnalysisResult, BaselineResult
from app.services.baseline_service import baseline_service
from app.utils.enums import ConfidenceLevel, SeverityLevel


class DetectionService:
    """Analytical engine for detecting unusual health signal deviations from baseline.
    NOTE: An anomaly score is an indicator of statistical deviation from normal activity,
    NOT proof or probability of an outbreak.
    """

    def __init__(self):
        self.default_threshold = settings.ANOMALY_ZSCORE_THRESHOLD

    def detect_anomaly(
        self,
        region_id: str,
        indicator: str,
        target_date: Optional[date] = None,
        historical_window_days: int = 28,
        sensitivity_threshold: Optional[float] = None,
    ) -> AnomalyAnalysisResult:
        """Run statistical anomaly detection for region and indicator on target date."""
        ref_date = target_date or date.today()
        threshold = sensitivity_threshold or self.default_threshold

        # 1. Retrieve current observation
        observations = observation_repository.get_historical(
            region_id=region_id,
            indicator=indicator,
            start_date=ref_date,
            end_date=ref_date,
        )

        observed_value = 0
        is_suppressed = False
        if observations:
            obs = observations[-1]
            observed_value = obs.count
            is_suppressed = obs.is_suppressed
        else:
            # If no record found for the exact target date, default to 0
            observed_value = 0

        # 2. Obtain baseline
        baseline: BaselineResult = baseline_service.calculate_baseline(
            region_id=region_id,
            indicator=indicator,
            target_date=ref_date,
            window_days=historical_window_days,
        )

        # 3. Handle low counts & privacy
        small_count_flag = observed_value < settings.PRIVACY_MIN_COUNT_THRESHOLD
        insufficient_history = not baseline.has_sufficient_history

        # 4. Calculate deviation score (Standardized Z-Score)
        # Use pseudo-variability floor if standard deviation is near zero
        variability = max(baseline.historical_variability, 1.0)
        deviation = observed_value - baseline.expected_value
        deviation_score = deviation / variability

        # Only deviations ABOVE expected baseline represent surveillance surge signals
        is_anomaly = (
            deviation_score >= threshold
            and observed_value > baseline.expected_value
            and not is_suppressed
        )

        # 5. Assess preliminary severity based on statistical deviation
        severity = SeverityLevel.LOW
        if is_anomaly:
            if deviation_score >= 4.0:
                severity = SeverityLevel.CRITICAL
            elif deviation_score >= 3.0:
                severity = SeverityLevel.HIGH
            elif deviation_score >= 2.0:
                severity = SeverityLevel.MEDIUM

        # 6. Assess confidence
        confidence = ConfidenceLevel.HIGH
        if insufficient_history or baseline.usable_observations_count < 14:
            confidence = ConfidenceLevel.LOW
        elif small_count_flag or baseline.usable_observations_count < 21:
            confidence = ConfidenceLevel.MEDIUM

        # 7. Construct transparent explanation
        if is_anomaly:
            explanation = (
                f"Statistically unusual signal: Observed count ({observed_value}) is "
                f"{deviation_score:.2f} standard deviations above the {historical_window_days}-day "
                f"expected baseline ({baseline.expected_value:.1f} ± {baseline.historical_variability:.1f}). "
                f"Classified as preliminary {severity.value} severity signal awaiting human review."
            )
        elif insufficient_history:
            explanation = (
                f"Signal within acceptable bounds or baseline history is limited "
                f"({baseline.usable_observations_count} points). Observed: {observed_value}, Expected: {baseline.expected_value:.1f}."
            )
        else:
            explanation = (
                f"Nominal activity: Observed count ({observed_value}) aligns with expected "
                f"historical baseline ({baseline.expected_value:.1f} ± {baseline.historical_variability:.1f}, score: {deviation_score:.2f})."
            )

        return AnomalyAnalysisResult(
            region_id=region_id,
            indicator=indicator,
            target_date=ref_date,
            observed_value=observed_value,
            baseline_expected=baseline.expected_value,
            deviation_score=round(deviation_score, 2),
            is_anomaly=is_anomaly,
            severity_assessment=severity,
            confidence=confidence,
            insufficient_history=insufficient_history,
            small_count_flag=small_count_flag,
            corroboration_summary=None,
            explanation=explanation,
        )


detection_service = DetectionService()
