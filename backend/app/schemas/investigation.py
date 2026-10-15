from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.utils.enums import InvestigationOutcome, InvestigationStatus


class InvestigationTimelineItem(BaseModel):
    timestamp: datetime
    author: str
    action: str
    details: Optional[str] = None


class InvestigationCreate(BaseModel):
    alert_id: str = Field(..., description="Alert ID triggering the investigation")
    title: str = Field(..., description="Descriptive title of the investigation")
    initial_notes: Optional[str] = Field(None, description="Initial triage or context notes")
    assigned_to: Optional[str] = Field(None, description="Assigned public health investigator")


class InvestigationUpdate(BaseModel):
    status: Optional[InvestigationStatus] = None
    outcome: Optional[InvestigationOutcome] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    resolution_summary: Optional[str] = None


class InvestigationNoteCreate(BaseModel):
    note: str = Field(..., min_length=1, description="Investigation case note content")


class InvestigationResponse(BaseModel):
    id: str
    alert_id: str
    title: str
    region_id: str
    indicator: str
    status: InvestigationStatus = InvestigationStatus.OPEN
    outcome: InvestigationOutcome = InvestigationOutcome.UNDER_EVALUATION
    assigned_to: Optional[str] = None
    created_by: str
    resolution_summary: Optional[str] = None
    timeline: List[InvestigationTimelineItem] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
