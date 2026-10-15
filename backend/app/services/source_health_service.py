from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

from app.schemas.data_source import DataSourceResponse
from app.utils.enums import DataSourceStatus, DataSourceType


class SourceHealthService:
    """Monitors ingestion freshness, operational status, and feed simulation transparency."""

    def __init__(self):
        now = datetime.now(timezone.utc)
        self._sources: Dict[str, dict] = {
            "SRC-SYNDROMIC-01": {
                "id": "SRC-SYNDROMIC-01",
                "name": "Regional Hospital Emergency & Urgent Care Syndromic Feed",
                "source_type": DataSourceType.CLINICAL_SYNDROMIC,
                "description": "Daily aggregate emergency room and clinic triage diagnoses for ILI and respiratory complaints.",
                "update_frequency": "DAILY",
                "is_simulated": True,  # Clearly labeled as simulated per hackathon transparency guidelines
                "jurisdiction": "State Department of Health",
                "status": DataSourceStatus.ACTIVE,
                "last_successful_sync": now - timedelta(hours=2),
                "freshness_hours": 2.1,
                "total_records_ingested": 14250,
                "data_quality_score": 98.5,
                "active_issues": None,
            },
            "SRC-PHARM-01": {
                "id": "SRC-PHARM-01",
                "name": "Community Pharmacy OTC Symptom Surveillance",
                "source_type": DataSourceType.PHARMACEUTICAL_OTC,
                "description": "Aggregate retail sales trends for over-the-counter cough, cold, and antipyretic formulations.",
                "update_frequency": "DAILY",
                "is_simulated": True,
                "jurisdiction": "National Retail Pharmacy Consortium",
                "status": DataSourceStatus.ACTIVE,
                "last_successful_sync": now - timedelta(hours=3),
                "freshness_hours": 3.4,
                "total_records_ingested": 8900,
                "data_quality_score": 96.0,
                "active_issues": None,
            },
            "SRC-EDU-01": {
                "id": "SRC-EDU-01",
                "name": "Public School District Daily Absenteeism Sentinel",
                "source_type": DataSourceType.EDUCATIONAL_ATTENDANCE,
                "description": "Aggregated daily student illness absence percentages across metropolitan school districts.",
                "update_frequency": "DAILY",
                "is_simulated": True,
                "jurisdiction": "Metro Department of Education",
                "status": DataSourceStatus.ACTIVE,
                "last_successful_sync": now - timedelta(hours=6),
                "freshness_hours": 6.2,
                "total_records_ingested": 4120,
                "data_quality_score": 94.2,
                "active_issues": None,
            },
            "SRC-LAB-01": {
                "id": "SRC-LAB-01",
                "name": "Reference Laboratory Pathogen Surveillance",
                "source_type": DataSourceType.LABORATORY_SURVEILLANCE,
                "description": "Aggregate molecular PCR positivity rates for Influenza A/B and RSV.",
                "update_frequency": "DAILY",
                "is_simulated": True,
                "jurisdiction": "Public Health Laboratory Network",
                "status": DataSourceStatus.ACTIVE,
                "last_successful_sync": now - timedelta(hours=4),
                "freshness_hours": 4.0,
                "total_records_ingested": 3200,
                "data_quality_score": 99.1,
                "active_issues": None,
            },
        }

    def list_sources(self) -> List[DataSourceResponse]:
        """List all permitted data sources with health and simulation flags."""
        return [DataSourceResponse(**s) for s in self._sources.values()]

    def get_source_by_id(self, source_id: str) -> Optional[DataSourceResponse]:
        """Fetch status and health metrics for a specific source."""
        data = self._sources.get(source_id)
        if data:
            return DataSourceResponse(**data)
        return None


source_health_service = SourceHealthService()
