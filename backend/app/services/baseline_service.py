from datetime import date, timedelta
from typing import List, Optional
import pandas as pd

from app.core.config import settings
from app.repositories.observation_repository import observation_repository
from app.schemas.analysis import BaselineResult
from app.schemas.observation import ObservationResponse


class BaselineService:
    """Calculates expected normal activity from eligible historical observations.
    Uses Pandas Series for computing rolling baseline statistics, variability, and sample adequacy.
    """

    def __init__(self):
        self.min_observations = settings.MIN_OBSERVATIONS_FOR_BASELINE

    def calculate_baseline(
        self,
        region_id: str,
        indicator: str,
        target_date: Optional[date] = None,
        window_days: int = 28,
    ) -> BaselineResult:
        """Calculate historical baseline for a specific region and indicator using Pandas.
        Target date observation is excluded from historical window to avoid contamination.
        """
        ref_date = target_date or date.today()
        start_date = ref_date - timedelta(days=window_days)
        # Exclude the target day itself from the training window
        end_date = ref_date - timedelta(days=1)

        historical = observation_repository.get_historical(
            region_id=region_id,
            indicator=indicator,
            start_date=start_date,
            end_date=end_date,
        )

        # Filter out suppressed or None counts
        valid_counts: List[int] = [
            obs.effective_count
            for obs in historical
            if not obs.is_suppressed and obs.effective_count is not None
        ]

        usable_count = len(valid_counts)
        has_sufficient_history = usable_count >= self.min_observations

        if usable_count == 0:
            return BaselineResult(
                region_id=region_id,
                indicator=indicator,
                expected_value=0.0,
                historical_variability=0.0,
                usable_observations_count=0,
                baseline_window_days=window_days,
                has_sufficient_history=False,
                limitations="No historical baseline observations available in the requested window.",
            )

        # Use Pandas Series for descriptive statistical calculations
        series = pd.Series(valid_counts, dtype=float)
        mean_val = float(series.mean())
        std_dev = float(series.std(ddof=1)) if usable_count > 1 else 0.0

        limitations = None
        if not has_sufficient_history:
            limitations = (
                f"Limited baseline history: only {usable_count} observation(s) available "
                f"(recommended minimum: {self.min_observations}). Interpret statistical deviations cautiously."
            )
        elif std_dev == 0.0:
            limitations = "Historical variance is zero; activity has been completely flat."

        return BaselineResult(
            region_id=region_id,
            indicator=indicator,
            expected_value=round(mean_val, 2),
            historical_variability=round(std_dev, 2),
            usable_observations_count=usable_count,
            baseline_window_days=window_days,
            has_sufficient_history=has_sufficient_history,
            limitations=limitations,
        )


baseline_service = BaselineService()
