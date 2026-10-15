import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.schemas.observation import (
    ObservationCreate,
    ObservationFilter,
    ObservationResponse,
)


class ObservationRepository:
    """Repository managing aggregate surveillance observations.
    Maintains historical observations for baseline calculation and anomaly detection.
    """

    def __init__(self):
        self._observations: Dict[str, dict] = {}
        self._seed_synthetic_history()

    def _seed_synthetic_history(self):
        """Seed 30 days of baseline observations across indicators and regions.
        Introduces natural variation, plus deliberate spike in REG-METRO-N on recent days.
        """
        today = date.today()
        regions = ["REG-METRO-N", "REG-METRO-S", "REG-EAST-SUB", "REG-WEST-VAL", "REG-DOWNTOWN"]
        indicators = ["ILI", "RESPIRATORY_CLINIC", "OTC_COUGH_COLD"]

        for region in regions:
            for ind in indicators:
                base_val = 45 if region == "REG-METRO-N" else 30
                if ind == "OTC_COUGH_COLD":
                    base_val = base_val * 2

                for day_offset in range(30, -1, -1):
                    obs_date = today - timedelta(days=day_offset)
                    # Natural variation: slight weekday vs weekend fluctuation
                    variation = (day_offset % 5) - 2
                    val = max(10, base_val + variation * 3)

                    # Deliberate anomaly for testing: spike in Metro North in last 2 days (including today)
                    if region == "REG-METRO-N" and ind == "ILI" and day_offset <= 2:
                        val = 98  # Sharp spike above normal baseline (~45)

                    obs_id = f"OBS-{uuid.uuid4().hex[:10]}"
                    self._observations[obs_id] = {
                        "id": obs_id,
                        "region_id": region,
                        "indicator": ind,
                        "reporting_date": obs_date,
                        "count": val,
                        "effective_count": val,
                        "is_suppressed": False,
                        "source_id": "SRC-SYNDROMIC-01" if ind != "OTC_COUGH_COLD" else "SRC-PHARM-01",
                        "metadata": {"synthetic": True, "facility_type": "Ambulatory"},
                        "created_at": datetime.now(timezone.utc) - timedelta(days=day_offset),
                    }

    def create(
        self,
        observation: ObservationCreate,
        is_suppressed: bool = False,
        effective_count: Optional[int] = None,
        db: Optional[Session] = None,
    ) -> ObservationResponse:
        """Persist a single aggregate observation."""
        obs_id = f"OBS-{uuid.uuid4().hex[:10]}"
        record = {
            "id": obs_id,
            "region_id": observation.region_id,
            "indicator": observation.indicator,
            "reporting_date": observation.reporting_date,
            "count": observation.count,
            "is_suppressed": is_suppressed,
            "effective_count": effective_count if not is_suppressed else None,
            "source_id": observation.source_id,
            "metadata": observation.metadata or {},
            "created_at": datetime.now(timezone.utc),
        }
        self._observations[obs_id] = record
        return ObservationResponse(**record)

    def create_batch(
        self,
        records: List[Tuple[ObservationCreate, bool, Optional[int]]],
        db: Optional[Session] = None,
    ) -> List[ObservationResponse]:
        """Persist a batch of observations safely."""
        created = []
        for obs, is_suppressed, effective_count in records:
            res = self.create(obs, is_suppressed, effective_count, db=db)
            created.append(res)
        return created

    def exists(
        self,
        region_id: str,
        indicator: str,
        reporting_date: date,
        source_id: str,
        db: Optional[Session] = None,
    ) -> bool:
        """Check for exact duplicate ingestion record."""
        for item in self._observations.values():
            if (
                item["region_id"] == region_id
                and item["indicator"] == indicator
                and item["reporting_date"] == reporting_date
                and item["source_id"] == source_id
            ):
                return True
        return False

    def get_historical(
        self,
        region_id: str,
        indicator: str,
        start_date: date,
        end_date: date,
        db: Optional[Session] = None,
    ) -> List[ObservationResponse]:
        """Fetch historical observations for baseline calculation."""
        results = []
        for item in self._observations.values():
            if (
                item["region_id"] == region_id
                and item["indicator"] == indicator
                and start_date <= item["reporting_date"] <= end_date
            ):
                results.append(ObservationResponse(**item))
        # Sort chronologically
        results.sort(key=lambda x: x.reporting_date)
        return results

    def query(
        self,
        filters: ObservationFilter,
        offset: int = 0,
        limit: int = 50,
        db: Optional[Session] = None,
    ) -> Tuple[List[ObservationResponse], int]:
        """Query observations with filter criteria and pagination."""
        matched = []
        for item in self._observations.values():
            if filters.region_id and item["region_id"] != filters.region_id:
                continue
            if filters.indicator and item["indicator"] != filters.indicator:
                continue
            if filters.source_id and item["source_id"] != filters.source_id:
                continue
            if filters.start_date and item["reporting_date"] < filters.start_date:
                continue
            if filters.end_date and item["reporting_date"] > filters.end_date:
                continue
            matched.append(ObservationResponse(**item))

        matched.sort(key=lambda x: x.reporting_date, reverse=True)
        total = len(matched)
        return matched[offset : offset + limit], total


observation_repository = ObservationRepository()
