from typing import Dict, List, Optional
from datetime import date
from sqlalchemy.orm import Session

from app.schemas.region import RegionCreate, RegionResponse


class RegionRepository:
    """Repository handling jurisdiction and region queries.
    Provides in-memory synthetic storage with clean hooks for teammate's database tables.
    """

    def __init__(self):
        # Synthetic initial regions for prototype surveillance
        self._regions: Dict[str, dict] = {
            "REG-METRO-N": {
                "id": "REG-METRO-N",
                "name": "Metro North District",
                "code": "MN-01",
                "parent_id": "STATE-01",
                "population": 420000,
                "latitude": 40.7831,
                "longitude": -73.9712,
                "active_alerts_count": 2,
                "total_observations_count": 240,
                "last_signal_date": date.today(),
            },
            "REG-METRO-S": {
                "id": "REG-METRO-S",
                "name": "Metro South District",
                "code": "MS-02",
                "parent_id": "STATE-01",
                "population": 380000,
                "latitude": 40.7128,
                "longitude": -74.0060,
                "active_alerts_count": 1,
                "total_observations_count": 210,
                "last_signal_date": date.today(),
            },
            "REG-EAST-SUB": {
                "id": "REG-EAST-SUB",
                "name": "Eastern Suburbs",
                "code": "ES-03",
                "parent_id": "STATE-01",
                "population": 290000,
                "latitude": 40.7282,
                "longitude": -73.7949,
                "active_alerts_count": 0,
                "total_observations_count": 180,
                "last_signal_date": date.today(),
            },
            "REG-WEST-VAL": {
                "id": "REG-WEST-VAL",
                "name": "Western Valley",
                "code": "WV-04",
                "parent_id": "STATE-01",
                "population": 315000,
                "latitude": 40.6976,
                "longitude": -74.1444,
                "active_alerts_count": 0,
                "total_observations_count": 160,
                "last_signal_date": date.today(),
            },
            "REG-DOWNTOWN": {
                "id": "REG-DOWNTOWN",
                "name": "Downtown Central",
                "code": "DT-05",
                "parent_id": "STATE-01",
                "population": 510000,
                "latitude": 40.7589,
                "longitude": -73.9851,
                "active_alerts_count": 1,
                "total_observations_count": 320,
                "last_signal_date": date.today(),
            },
        }

    def get_by_id(self, region_id: str, db: Optional[Session] = None) -> Optional[RegionResponse]:
        """Fetch a single region by ID."""
        data = self._regions.get(region_id)
        if data:
            return RegionResponse(**data)
        return None

    def list_regions(self, db: Optional[Session] = None) -> List[RegionResponse]:
        """Return all registered surveillance regions."""
        return [RegionResponse(**data) for data in self._regions.values()]

    def create(self, region: RegionCreate, db: Optional[Session] = None) -> RegionResponse:
        """Register a new region."""
        data = region.model_dump()
        data["active_alerts_count"] = 0
        data["total_observations_count"] = 0
        data["last_signal_date"] = date.today()
        self._regions[region.id] = data
        return RegionResponse(**data)

    def update_alert_count(self, region_id: str, delta: int):
        """Update active alert tally for a region."""
        if region_id in self._regions:
            current = self._regions[region_id].get("active_alerts_count", 0)
            self._regions[region_id]["active_alerts_count"] = max(0, current + delta)


region_repository = RegionRepository()
