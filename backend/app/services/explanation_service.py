from typing import List, Optional
from app.schemas.alert import CorroborationEvidence
from app.schemas.analysis import AnomalyAnalysisResult


class ExplanationService:
    """Generates transparent, explainable natural-language rationales for alerts."""

    def build_alert_explanation(
        self,
        analysis: AnomalyAnalysisResult,
        corroboration_evidence: List[CorroborationEvidence],
        data_quality_notes: Optional[str] = None,
    ) -> str:
        """Compose an explainable description of why an alert was generated,
        highlighting observed vs baseline, statistical significance, corroborating evidence, and uncertainty.
        """
        parts = []

        # 1. Primary signal finding
        parts.append(
            f"Observed aggregate {analysis.indicator} count ({analysis.observed_value}) exceeds the "
            f"historical baseline of {analysis.baseline_expected:.1f} by {analysis.deviation_score:.2f} standard deviations."
        )

        # 2. Corroboration status
        if corroboration_evidence:
            corrob_details = [
                f"{c.indicator} ({c.observed_trend}, strength: {c.signal_strength})"
                for c in corroboration_evidence
            ]
            parts.append(
                f"Signal is cross-corroborated by independent indicator(s): {'; '.join(corrob_details)}."
            )
        else:
            parts.append(
                "Cross-indicator corroboration is currently unconfirmed in secondary surveillance streams."
            )

        # 3. Limitations / Uncertainty
        if analysis.insufficient_history:
            parts.append(
                "NOTE: Baseline calculated from limited historical observations; deviation score carries higher uncertainty."
            )
        if analysis.small_count_flag:
            parts.append(
                "Small-cell count alert: subject to statistical fluctuation in low-density catchment areas."
            )

        # 4. Human review required disclaimer
        parts.append(
            "Preliminary alert generated for public health triaging. Requires epidemiologist verification prior to community action."
        )

        return " ".join(parts)


explanation_service = ExplanationService()
