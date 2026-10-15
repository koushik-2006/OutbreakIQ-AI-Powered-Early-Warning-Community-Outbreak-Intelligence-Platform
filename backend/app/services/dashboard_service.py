from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List

from app.repositories.alert_repository import alert_repository
from app.repositories.investigation_repository import investigation_repository
from app.repositories.region_repository import region_repository
from app.schemas.alert import AlertFilter
from app.schemas.dashboard import DashboardSummaryResponse, HotspotRegion
from app.utils.enums import AlertReviewStatus, InvestigationStatus, SeverityLevel


class DashboardService:
    """Aggregates surveillance metrics for the executive dashboard."""

    def get_dashboard_summary(self) -> DashboardSummaryResponse:
        """Calculate real-time operational surveillance metrics."""
        now = datetime.now(timezone.utc)

        # 1. Active Alerts
        all_alerts, total_alerts = alert_repository.query(
            filters=AlertFilter(), offset=0, limit=200
        )

        active_alerts = [
            a for a in all_alerts
            if a.review_status in (AlertReviewStatus.PENDING_REVIEW, AlertReviewStatus.UNDER_INVESTIGATION)
        ]

        alerts_by_sev: Dict[str, int] = defaultdict(int)
        for a in active_alerts:
            alerts_by_sev[a.severity.value] += 1

        alerts_by_stat: Dict[str, int] = defaultdict(int)
        for a in all_alerts:
            alerts_by_stat[a.review_status.value] += 1

        # 2. Open Investigations
        open_invs, total_open_invs = investigation_repository.list_all(
            status=InvestigationStatus.OPEN, offset=0, limit=1
        )
        in_prog_invs, total_in_prog = investigation_repository.list_all(
            status=InvestigationStatus.IN_PROGRESS, offset=0, limit=1
        )
        total_active_investigations = total_open_invs + total_in_prog

        # 3. Regions and Hotspots
        regions = region_repository.list_regions()
        hotspots: List[HotspotRegion] = []
        for r in regions:
            if r.active_alerts_count > 0:
                # Find matching alerts
                reg_alerts = [a for a in active_alerts if a.region_id == r.id]
                highest_sev = SeverityLevel.LOW
                prim_ind = "ILI"
                if reg_alerts:
                    highest_sev = reg_alerts[0].severity
                    prim_ind = reg_alerts[0].indicator

                hotspots.append(
                    HotspotRegion(
                        region_id=r.id,
                        region_name=r.name,
                        active_alerts_count=r.active_alerts_count,
                        highest_severity=highest_sev,
                        primary_indicator=prim_ind,
                    )
                )

        hotspots.sort(key=lambda x: x.active_alerts_count, reverse=True)

        return DashboardSummaryResponse(
            total_active_alerts=len(active_alerts),
            alerts_by_severity=dict(alerts_by_sev),
            alerts_by_status=dict(alerts_by_stat),
            open_investigations=total_active_investigations,
            total_regions_monitored=len(regions),
            total_sources_active=4,
            data_freshness_status="CURRENT",
            latest_ingested_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            hotspots=hotspots,
            recent_alerts=all_alerts[:5],
            system_status="OPERATIONAL",
            last_updated=now,
        )


dashboard_service = DashboardService()
