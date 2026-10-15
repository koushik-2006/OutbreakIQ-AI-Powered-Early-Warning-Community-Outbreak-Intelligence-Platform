from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, model_validator

from app.core.exceptions import IdentifiableDataRejectedError
from app.utils.enums import IndicatorType

# Known PII field names that must never be present in aggregate observation records
PII_DENYLIST = {
    "patient_name",
    "name",
    "ssn",
    "mrn",
    "patient_id",
    "dob",
    "phone",
    "address",
    "email",
    "social_security",
    "national_id",
}


class ObservationBase(BaseModel):
    region_id: str = Field(..., description="Target administrative region ID")
    indicator: str = Field(..., description="Surveillance indicator type (e.g. ILI, RESPIRATORY_CLINIC)")
    reporting_date: date = Field(..., description="Date of aggregated reporting (YYYY-MM-DD)")
    count: int = Field(..., ge=0, description="Authorized aggregate count of cases/sales/events")
    source_id: str = Field(..., description="Identifier of the reporting data source")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Authorized contextual tags (facility type, age band, etc.)")

    @model_validator(mode="before")
    @classmethod
    def reject_identifiable_patient_data(cls, values: Any) -> Any:
        if isinstance(values, dict):
            # Check top-level keys
            for key in values.keys():
                if key.lower() in PII_DENYLIST:
                    raise IdentifiableDataRejectedError(field_name=key)
            # Check metadata keys if supplied
            meta = values.get("metadata")
            if isinstance(meta, dict):
                for m_key in meta.keys():
                    if m_key.lower() in PII_DENYLIST:
                        raise IdentifiableDataRejectedError(field_name=f"metadata.{m_key}")
        return values


class ObservationCreate(ObservationBase):
    pass


class ObservationBatchCreate(BaseModel):
    observations: List[ObservationCreate] = Field(..., min_length=1, max_length=5000)


class ObservationResponse(ObservationBase):
    id: str
    is_suppressed: bool = Field(
        default=False,
        description="True if count is suppressed to protect small-group confidentiality",
    )
    effective_count: Optional[int] = Field(
        None,
        description="Null if suppressed for privacy, otherwise the observed aggregate count",
    )
    created_at: datetime


class ObservationFilter(BaseModel):
    region_id: Optional[str] = None
    indicator: Optional[str] = None
    source_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
