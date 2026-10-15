from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.alert import AlertResponse
from app.utils.enums import SeverityLevel


class HotspotRegion(BaseModel):
    region_id: str
    region_name: str
    active_alerts_count: int
    highest_severity: SeverityLevel
    primary_indicator: str


class DashboardSummaryResponse(BaseModel):
    total_active_alerts: int
    alerts_by_severity: Dict[str, int]
    alerts_by_status: Dict[str, int]
    open_investigations: int
    total_regions_monitored: int
    total_sources_active: int
    data_freshness_status: str = "CURRENT"
    latest_ingested_date: Optional[str] = None
    hotspots: List[HotspotRegion] = Field(default_factory=list)
    recent_alerts: List[AlertResponse] = Field(default_factory=list)
    system_status: str = "OPERATIONAL"
    last_updated: datetime
