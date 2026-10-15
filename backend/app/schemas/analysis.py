from datetime import date
from typing import List, Optional
from pydantic import BaseModel, Field

from app.utils.enums import ConfidenceLevel, SeverityLevel


class BaselineResult(BaseModel):
    region_id: str
    indicator: str
    expected_value: float = Field(..., description="Calculated expected baseline level (e.g. mean or median)")
    historical_variability: float = Field(..., description="Standard deviation or IQR of baseline")
    usable_observations_count: int = Field(..., description="Count of valid historical data points used")
    baseline_window_days: int
    has_sufficient_history: bool = Field(..., description="True if minimum historical data points met")
    limitations: Optional[str] = Field(None, description="Analytical caveats, e.g. low sample size or holidays")


class AnomalyAnalysisRequest(BaseModel):
    region_id: str
    indicator: str
    target_date: Optional[date] = None
    historical_window_days: int = 28
    sensitivity_threshold: float = 2.0


class AnomalyAnalysisResult(BaseModel):
    region_id: str
    indicator: str
    target_date: date
    observed_value: int
    baseline_expected: float
    deviation_score: float = Field(
        ...,
        description="Standardized anomaly score (e.g. modified Z-score). An anomaly is an unusual signal, not proof of an outbreak.",
    )
    is_anomaly: bool
    severity_assessment: SeverityLevel
    confidence: ConfidenceLevel
    insufficient_history: bool = False
    small_count_flag: bool = False
    corroboration_summary: Optional[str] = None
    explanation: str
