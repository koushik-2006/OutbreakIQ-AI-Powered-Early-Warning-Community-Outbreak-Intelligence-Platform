from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.utils.enums import DataSourceStatus, DataSourceType


class DataSourceBase(BaseModel):
    id: str = Field(..., description="Unique source code, e.g. SRC-SYNDROMIC-01")
    name: str = Field(..., description="Human-readable source title")
    source_type: DataSourceType = Field(..., description="Category of aggregate surveillance feed")
    description: Optional[str] = None
    update_frequency: str = Field(default="DAILY", description="Expected cadence (HOURLY, DAILY, WEEKLY)")
    is_simulated: bool = Field(default=False, description="Flag indicating synthetic/demonstration feed")
    jurisdiction: Optional[str] = Field(default="Regional Health Authority")


class DataSourceCreate(DataSourceBase):
    pass


class DataSourceResponse(DataSourceBase):
    status: DataSourceStatus = DataSourceStatus.ACTIVE
    last_successful_sync: Optional[datetime] = None
    freshness_hours: Optional[float] = None
    total_records_ingested: int = 0
    data_quality_score: float = Field(default=100.0, ge=0.0, le=100.0, description="Freshness and completeness score")
    active_issues: Optional[str] = None
