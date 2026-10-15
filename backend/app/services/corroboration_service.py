from datetime import date
from typing import List, Tuple

from app.repositories.observation_repository import observation_repository
from app.schemas.alert import CorroborationEvidence
from app.services.baseline_service import baseline_service

# Related indicators that cross-corroborate syndromic signals
INDICATOR_AFFINITY = {
    "ILI": ["OTC_COUGH_COLD", "RESPIRATORY_CLINIC", "SCHOOL_ABSENTEEISM"],
    "RESPIRATORY_CLINIC": ["ILI", "OTC_COUGH_COLD"],
    "OTC_COUGH_COLD": ["ILI", "RESPIRATORY_CLINIC"],
    "GASTROINTESTINAL": ["SCHOOL_ABSENTEEISM"],
}


class CorroborationService:
    """Evaluates cross-indicator signals to corroborate detected anomalies."""

    def evaluate_corroboration(
        self,
        region_id: str,
        primary_indicator: str,
        target_date: date,
    ) -> Tuple[List[CorroborationEvidence], str]:
        """Check independent surveillance indicators in the same region for corroborating signals."""
        partner_indicators = INDICATOR_AFFINITY.get(primary_indicator, [])
        evidence_list: List[CorroborationEvidence] = []
        corroborated_count = 0

        for partner in partner_indicators:
            obs_list = observation_repository.get_historical(
                region_id=region_id,
                indicator=partner,
                start_date=target_date,
                end_date=target_date,
            )
            if not obs_list:
                continue

            current_obs = obs_list[-1]
            if current_obs.is_suppressed or current_obs.effective_count is None:
                continue

            # Compare partner indicator to its baseline
            partner_baseline = baseline_service.calculate_baseline(
                region_id=region_id,
                indicator=partner,
                target_date=target_date,
                window_days=28,
            )

            partner_std = max(partner_baseline.historical_variability, 1.0)
            partner_z = (current_obs.effective_count - partner_baseline.expected_value) / partner_std

            if partner_z >= 1.5:
                corroborated_count += 1
                strength = "STRONG" if partner_z >= 2.5 else "MODERATE"
                percent_elevated = (
                    ((current_obs.effective_count - partner_baseline.expected_value) / partner_baseline.expected_value) * 100
                    if partner_baseline.expected_value > 0
                    else 0
                )
                evidence_list.append(
                    CorroborationEvidence(
                        indicator=partner,
                        source_name=current_obs.source_id,
                        observed_trend=f"+{percent_elevated:.1f}% vs baseline (Z={partner_z:.2f})",
                        signal_strength=strength,
                        consistent_with_primary=True,
                    )
                )

        if corroborated_count > 0:
            summary = (
                f"Corroborated by {corroborated_count} independent surveillance source(s): "
                f"{', '.join(e.indicator for e in evidence_list)} showing concurrent elevation."
            )
        else:
            summary = "No concurrent elevation observed in secondary indicators; isolated signal."

        return evidence_list, summary


corroboration_service = CorroborationService()
