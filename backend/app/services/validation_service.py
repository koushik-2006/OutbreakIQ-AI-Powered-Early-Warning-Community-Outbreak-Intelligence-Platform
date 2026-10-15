import csv
import io
from datetime import date
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings
from app.core.exceptions import (
    DataValidationError,
    IdentifiableDataRejectedError,
)
from app.repositories.observation_repository import observation_repository
from app.repositories.region_repository import region_repository
from app.schemas.observation import PII_DENYLIST, ObservationCreate
from app.utils.dates import parse_date
from app.utils.enums import IndicatorType


class ValidationService:
    """Service enforcing privacy protection, input integrity, and schema compliance."""

    def __init__(self):
        self.min_count_threshold = settings.PRIVACY_MIN_COUNT_THRESHOLD

    def validate_patient_privacy(self, record: Dict[str, Any]):
        """Verify that record does not contain any direct patient identifiers."""
        for key in record.keys():
            normalized = key.lower().replace("-", "_").replace(" ", "_")
            if normalized in PII_DENYLIST:
                raise IdentifiableDataRejectedError(field_name=key)

    def apply_privacy_suppression(self, count: int) -> Tuple[bool, Optional[int]]:
        """Apply cell suppression to small numbers to prevent re-identification.
        Returns:
            (is_suppressed, effective_count)
            If count is below threshold (e.g. 1 <= count < 5), it is suppressed.
        """
        if 0 < count < self.min_count_threshold:
            return True, None
        return False, count

    def validate_observation(
        self,
        observation: ObservationCreate,
        check_duplicate: bool = True,
    ) -> Tuple[ObservationCreate, bool, Optional[int]]:
        """Validate single aggregate observation against domain rules."""
        # Check region existence
        region = region_repository.get_by_id(observation.region_id)
        if not region:
            raise DataValidationError(
                f"Invalid region reference: '{observation.region_id}' does not exist in registry."
            )

        # Check date not in future
        if observation.reporting_date > date.today():
            raise DataValidationError(
                f"Reporting date '{observation.reporting_date}' cannot be in the future."
            )

        # Check count non-negative
        if observation.count < 0:
            raise DataValidationError("Aggregate observation count cannot be negative.")

        # Check duplicate
        if check_duplicate:
            if observation_repository.exists(
                region_id=observation.region_id,
                indicator=observation.indicator,
                reporting_date=observation.reporting_date,
                source_id=observation.source_id,
            ):
                raise DataValidationError(
                    f"Duplicate observation: record for region '{observation.region_id}', "
                    f"indicator '{observation.indicator}', date '{observation.reporting_date}', "
                    f"and source '{observation.source_id}' already exists."
                )

        # Privacy suppression evaluation
        is_suppressed, effective_count = self.apply_privacy_suppression(observation.count)
        return observation, is_suppressed, effective_count

    def validate_csv_content(
        self, csv_bytes: bytes, source_id: str
    ) -> List[Tuple[ObservationCreate, bool, Optional[int]]]:
        """Validate and parse uploaded CSV file of aggregate surveillance records.
        Expected columns: region_id, indicator, reporting_date, count (optional: metadata_*)
        """
        try:
            content = csv_bytes.decode("utf-8-sig")
        except UnicodeDecodeError:
            try:
                content = csv_bytes.decode("latin-1")
            except Exception as e:
                raise DataValidationError(f"Could not decode CSV text: {e}")

        reader = csv.DictReader(io.StringIO(content))
        if not reader.fieldnames:
            raise DataValidationError("Uploaded CSV is empty or has no header row.")

        # Header PII check
        for header in reader.fieldnames:
            norm_header = header.lower().strip()
            if norm_header in PII_DENYLIST:
                raise IdentifiableDataRejectedError(field_name=header)

        required_cols = {"region_id", "indicator", "reporting_date", "count"}
        missing_cols = required_cols - {c.lower().strip() for c in reader.fieldnames}
        if missing_cols:
            raise DataValidationError(f"CSV missing mandatory columns: {', '.join(missing_cols)}")

        validated_records: List[Tuple[ObservationCreate, bool, Optional[int]]] = []
        row_num = 1

        for row in reader:
            row_num += 1
            # Clean keys
            clean_row = {k.lower().strip(): v.strip() for k, v in row.items() if k and v is not None}

            # Reject individual patient entries if PII values present
            self.validate_patient_privacy(clean_row)

            # Parse count
            try:
                count_val = int(clean_row["count"])
            except ValueError:
                raise DataValidationError(f"Row {row_num}: Invalid count '{clean_row.get('count')}' (must be integer)")

            # Parse date
            try:
                rep_date = parse_date(clean_row["reporting_date"])
            except Exception:
                raise DataValidationError(f"Row {row_num}: Invalid date format '{clean_row.get('reporting_date')}'. Use YYYY-MM-DD.")

            # Create model
            obs = ObservationCreate(
                region_id=clean_row["region_id"],
                indicator=clean_row["indicator"],
                reporting_date=rep_date,
                count=count_val,
                source_id=clean_row.get("source_id", source_id),
                metadata={"imported_via": "csv_upload", "row": row_num},
            )

            validated_obs, is_suppressed, eff_count = self.validate_observation(
                obs, check_duplicate=False
            )
            validated_records.append((validated_obs, is_suppressed, eff_count))

        if not validated_records:
            raise DataValidationError("CSV contains no data rows.")

        return validated_records


validation_service = ValidationService()
