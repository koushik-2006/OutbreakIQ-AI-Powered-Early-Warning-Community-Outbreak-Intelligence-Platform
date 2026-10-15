from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.utils.enums import AlertReviewStatus, ConfidenceLevel, SeverityLevel


class CorroborationEvidence(BaseModel):
    indicator: str
    source_name: str
    observed_trend: str
    signal_strength: str
    consistent_with_primary: bool


class AlertBase(BaseModel):
    region_id: str
    region_name: Optional[str] = None
    indicator: str
    reporting_date: date
    observed_value: int
    baseline_expected: float
    deviation_score: float
    severity: SeverityLevel
    confidence: ConfidenceLevel
    explanation: str
    evidence_summary: Optional[str] = None
    corroborating_signals: List[CorroborationEvidence] = Field(default_factory=list)
    data_quality_notes: Optional[str] = None


class AlertCreate(AlertBase):
    pass


class AlertReviewUpdate(BaseModel):
    review_status: AlertReviewStatus = Field(..., description="Updated review state")
    review_notes: Optional[str] = Field(None, description="Epidemiologist or analyst evaluation notes")
    assigned_to: Optional[str] = Field(None, description="Username assigned to review")


class AlertResponse(AlertBase):
    id: str
    review_status: AlertReviewStatus = AlertReviewStatus.PENDING_REVIEW
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class AlertFilter(BaseModel):
    region_id: Optional[str] = None
    indicator: Optional[str] = None
    severity: Optional[SeverityLevel] = None
    review_status: Optional[AlertReviewStatus] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
