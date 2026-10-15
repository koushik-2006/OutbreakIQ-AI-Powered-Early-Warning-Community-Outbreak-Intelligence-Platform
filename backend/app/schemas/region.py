from datetime import date
from typing import List, Optional
from pydantic import BaseModel, Field


class RegionBase(BaseModel):
    id: str = Field(..., description="Unique region identifier (e.g. REG-01, NYC-DIST-1)")
    name: str = Field(..., description="Geographic area name")
    code: str = Field(..., description="Standardized administrative or postal code")
    parent_id: Optional[str] = Field(None, description="Parent jurisdiction ID for hierarchical aggregation")
    population: Optional[int] = Field(None, ge=1, description="Estimated population of the region")
    latitude: Optional[float] = Field(None, description="Geographic latitude for mapping")
    longitude: Optional[float] = Field(None, description="Geographic longitude for mapping")


class RegionCreate(RegionBase):
    pass


class RegionResponse(RegionBase):
    active_alerts_count: int = 0
    total_observations_count: int = 0
    last_signal_date: Optional[date] = None


class RegionTrendPoint(BaseModel):
    reporting_date: date
    indicator: str
    observed_count: int
    baseline_expected: float
    deviation_score: float
    is_anomaly: bool


class RegionTrendsResponse(BaseModel):
    region_id: str
    region_name: str
    start_date: date
    end_date: date
    trends: List[RegionTrendPoint]
