from datetime import date, timedelta
from typing import Dict, List, Tuple
import pandas as pd

from app.schemas.observation import ObservationResponse


class AggregationService:
    """Service providing spatial and temporal aggregations across health signals using Pandas."""

    def aggregate_by_period(
        self,
        observations: List[ObservationResponse],
        period: str = "daily",
    ) -> List[Dict]:
        """Aggregate observations by reporting period ('daily' or 'weekly') using Pandas DataFrame grouping."""
        valid_records = [
            {
                "region_id": obs.region_id,
                "indicator": obs.indicator,
                "reporting_date": obs.reporting_date,
                "count": obs.effective_count,
            }
            for obs in observations
            if not obs.is_suppressed and obs.effective_count is not None
        ]

        if not valid_records:
            return []

        df = pd.DataFrame(valid_records)

        if period.lower() == "weekly":
            # Align each reporting date to Monday of that week
            df["period_date"] = df["reporting_date"].apply(
                lambda d: d - timedelta(days=d.weekday())
            )
        else:
            df["period_date"] = df["reporting_date"]

        grouped = (
            df.groupby(["region_id", "indicator", "period_date"])["count"]
            .sum()
            .reset_index()
        )

        results = []
        for _, row in grouped.iterrows():
            results.append(
                {
                    "region_id": str(row["region_id"]),
                    "indicator": str(row["indicator"]),
                    "period_date": row["period_date"],
                    "period_type": period,
                    "total_count": int(row["count"]),
                }
            )

        results.sort(key=lambda x: (x["period_date"], x["region_id"]))
        return results

    def compute_indicator_totals(
        self, observations: List[ObservationResponse]
    ) -> Dict[str, int]:
        """Compute total unsuppressed counts grouped by indicator using Pandas."""
        valid_records = [
            {"indicator": obs.indicator, "count": obs.effective_count}
            for obs in observations
            if not obs.is_suppressed and obs.effective_count is not None
        ]
        if not valid_records:
            return {}

        df = pd.DataFrame(valid_records)
        totals = df.groupby("indicator")["count"].sum().to_dict()
        return {k: int(v) for k, v in totals.items()}


aggregation_service = AggregationService()
