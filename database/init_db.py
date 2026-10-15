#!/usr/bin/env python3
"""Database Initialization and Synthetic Seed Script for OutbreakIQ.

Supports both PostgreSQL and SQLite.
Creates all relational tables and seeds 30 days of baseline surveillance data,
geographical regions, feeds, alerts, and investigations.
"""

import json
import os
import sys
import uuid
from datetime import date, datetime, timedelta, timezone

# Ensure backend directory is in python path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base
from app.models.surveillance import (
    AlertModel,
    AuditLogModel,
    DataSourceModel,
    InvestigationModel,
    ObservationModel,
    RegionModel,
)


def get_target_engine():
    db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    print(f"[OutbreakIQ DB] Initializing schema with URL: {db_url}")
    return create_engine(db_url, connect_args=connect_args)


def init_and_seed_database():
    engine = get_target_engine()
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Check if already seeded
        existing_regions = session.execute(select(RegionModel)).scalars().all()
        if existing_regions:
            print(f"[OutbreakIQ DB] Database already contains {len(existing_regions)} regions. Skipping full reseed.")
            return

        print("[OutbreakIQ DB] Seeding 5 surveillance regions...")
        today = date.today()
        now = datetime.now(timezone.utc)

        regions_data = [
            {
                "id": "REG-METRO-N",
                "name": "Metro North District",
                "code": "MN-01",
                "parent_id": "STATE-01",
                "population": 420000,
                "latitude": 40.7831,
                "longitude": -73.9712,
                "active_alerts_count": 2,
                "total_observations_count": 240,
                "last_signal_date": today,
            },
            {
                "id": "REG-METRO-S",
                "name": "Metro South District",
                "code": "MS-02",
                "parent_id": "STATE-01",
                "population": 380000,
                "latitude": 40.7128,
                "longitude": -74.0060,
                "active_alerts_count": 1,
                "total_observations_count": 210,
                "last_signal_date": today,
            },
            {
                "id": "REG-EAST-SUB",
                "name": "Eastern Suburbs",
                "code": "ES-03",
                "parent_id": "STATE-01",
                "population": 290000,
                "latitude": 40.7282,
                "longitude": -73.7949,
                "active_alerts_count": 0,
                "total_observations_count": 180,
                "last_signal_date": today,
            },
            {
                "id": "REG-WEST-VAL",
                "name": "Western Valley",
                "code": "WV-04",
                "parent_id": "STATE-01",
                "population": 315000,
                "latitude": 40.6976,
                "longitude": -74.1444,
                "active_alerts_count": 0,
                "total_observations_count": 160,
                "last_signal_date": today,
            },
            {
                "id": "REG-DOWNTOWN",
                "name": "Downtown Central",
                "code": "DT-05",
                "parent_id": "STATE-01",
                "population": 510000,
                "latitude": 40.7589,
                "longitude": -73.9851,
                "active_alerts_count": 1,
                "total_observations_count": 320,
                "last_signal_date": today,
            },
        ]

        for reg in regions_data:
            session.add(RegionModel(**reg))

        print("[OutbreakIQ DB] Seeding surveillance data sources...")
        sources_data = [
            {
                "id": "SRC-SYNDROMIC-01",
                "name": "Metro Syndromic Emergency Feeds",
                "source_type": "EHR_EMERGENCY",
                "indicator": "ILI",
                "frequency": "DAILY",
                "is_active": True,
                "is_simulated": False,
                "last_received_at": now - timedelta(hours=2),
                "facility_count": 18,
                "coverage_notes": "100% tertiary hospitals reporting nominal aggregate syndromic volume.",
            },
            {
                "id": "SRC-PHARM-01",
                "name": "Retail OTC Surveillance Network",
                "source_type": "PHARMACY_SALES",
                "indicator": "OTC_COUGH_COLD",
                "frequency": "DAILY",
                "is_active": True,
                "is_simulated": False,
                "last_received_at": now - timedelta(hours=1),
                "facility_count": 42,
                "coverage_notes": "Major community pharmacy chains reporting OTC respiratory transactions.",
            },
            {
                "id": "SRC-CLINIC-01",
                "name": "Sentinel Outpatient Network",
                "source_type": "SENTINEL_CLINIC",
                "indicator": "RESPIRATORY_CLINIC",
                "frequency": "DAILY",
                "is_active": True,
                "is_simulated": False,
                "last_received_at": now - timedelta(hours=3),
                "facility_count": 12,
                "coverage_notes": "Family medicine and urgent care sentinel clinics.",
            },
        ]
        for src in sources_data:
            session.add(DataSourceModel(**src))

        print("[OutbreakIQ DB] Seeding 30-day baseline observations across all regions...")
        regions = ["REG-METRO-N", "REG-METRO-S", "REG-EAST-SUB", "REG-WEST-VAL", "REG-DOWNTOWN"]
        indicators = ["ILI", "RESPIRATORY_CLINIC", "OTC_COUGH_COLD"]
        obs_count = 0

        for region in regions:
            for ind in indicators:
                base_val = 45 if region == "REG-METRO-N" else 30
                if ind == "OTC_COUGH_COLD":
                    base_val = base_val * 2

                for day_offset in range(30, -1, -1):
                    obs_date = today - timedelta(days=day_offset)
                    variation = (day_offset % 5) - 2
                    val = max(10, base_val + variation * 3)

                    # Spike in Metro North ILI for anomaly testing
                    if region == "REG-METRO-N" and ind == "ILI" and day_offset <= 2:
                        val = 98

                    obs_id = f"OBS-{uuid.uuid4().hex[:10]}"
                    source_id = "SRC-SYNDROMIC-01" if ind != "OTC_COUGH_COLD" else "SRC-PHARM-01"
                    session.add(
                        ObservationModel(
                            id=obs_id,
                            region_id=region,
                            indicator=ind,
                            reporting_date=obs_date,
                            count=val,
                            effective_count=val,
                            is_suppressed=False,
                            source_id=source_id,
                            metadata_json=json.dumps({"synthetic": True, "facility_type": "Ambulatory"}),
                            created_at=now - timedelta(days=day_offset),
                        )
                    )
                    obs_count += 1

        print(f"[OutbreakIQ DB] Seeded {obs_count} historical observations.")

        print("[OutbreakIQ DB] Seeding initial preliminary alerts...")
        alert_1 = AlertModel(
            id="ALT-METRO-N-001",
            region_id="REG-METRO-N",
            region_name="Metro North District",
            indicator="ILI",
            reporting_date=today,
            observed_value=98,
            baseline_expected=45.2,
            deviation_score=3.42,
            severity="HIGH",
            confidence="HIGH",
            explanation="Observed aggregate ILI count (98) exceeds 28-day rolling baseline (45.2 ± 15.4) by 3.42 standard deviations. Signal is corroborated by a 35% surge in OTC cough/cold remedy transactions across local retail pharmacies.",
            evidence_summary="Primary signal: Syndromic ILI visits elevated for 2 consecutive reporting intervals.",
            corroborating_signals_json=json.dumps([
                {
                    "indicator": "OTC_COUGH_COLD",
                    "source_name": "Metro Pharmacy Surveillance",
                    "observed_trend": "+35% week-over-week increase",
                    "signal_strength": "STRONG",
                    "consistent_with_primary": True,
                }
            ]),
            data_quality_notes="Data freshness: updated 2 hours ago. 100% reporting facilities reporting.",
            review_status="PENDING_REVIEW",
            reviewed_by=None,
            reviewed_at=None,
            review_notes=None,
            created_at=now - timedelta(hours=3),
            updated_at=now - timedelta(hours=3),
        )
        alert_2 = AlertModel(
            id="ALT-DOWNTOWN-002",
            region_id="REG-DOWNTOWN",
            region_name="Downtown Central",
            indicator="RESPIRATORY_CLINIC",
            reporting_date=today - timedelta(days=1),
            observed_value=72,
            baseline_expected=41.0,
            deviation_score=2.65,
            severity="MEDIUM",
            confidence="MEDIUM",
            explanation="Respiratory outpatient visits (72) elevated 2.65 standard deviations above 28-day rolling average (41.0).",
            evidence_summary="Unusual mid-week cluster in commercial core.",
            corroborating_signals_json="[]",
            data_quality_notes="All ambulatory sentinel feeds operating nominally.",
            review_status="UNDER_INVESTIGATION",
            reviewed_by="dr_chen",
            reviewed_at=now - timedelta(hours=14),
            review_notes="Triage started; checking school district attendance data.",
            created_at=now - timedelta(days=1),
            updated_at=now - timedelta(hours=14),
        )
        session.add(alert_1)
        session.add(alert_2)

        print("[OutbreakIQ DB] Seeding initial case investigation...")
        inv_1 = InvestigationModel(
            id="INV-2025-001",
            alert_id="ALT-DOWNTOWN-002",
            title="Downtown Clinic Respiratory Surge Investigation",
            region_id="REG-DOWNTOWN",
            indicator="RESPIRATORY_CLINIC",
            status="IN_PROGRESS",
            outcome="UNDER_EVALUATION",
            assigned_to="dr_chen",
            created_by="dr_chen",
            resolution_summary=None,
            timeline_json=json.dumps([
                {
                    "timestamp": (now - timedelta(hours=14)).isoformat(),
                    "author": "dr_chen",
                    "action": "INVESTIGATION_OPENED",
                    "details": "Triggered from alert ALT-DOWNTOWN-002: Respiratory visits exceeding expected baseline.",
                },
                {
                    "timestamp": (now - timedelta(hours=8)).isoformat(),
                    "author": "dr_chen",
                    "action": "NOTE_ADDED",
                    "details": "Contacted sentinel clinic coordinator; checking if flu season or event cluster.",
                },
            ]),
            created_at=now - timedelta(hours=14),
            updated_at=now - timedelta(hours=8),
        )
        session.add(inv_1)

        print("[OutbreakIQ DB] Seeding initial compliance audit event...")
        audit_1 = AuditLogModel(
            id=f"AUD-{uuid.uuid4().hex[:8]}",
            timestamp=now - timedelta(hours=14),
            action="INVESTIGATION_CREATE",
            actor_username="dr_chen",
            target_entity="Investigation",
            target_id="INV-2025-001",
            details="Investigation created for alert ALT-DOWNTOWN-002: Downtown Clinic Respiratory Surge Investigation",
        )
        session.add(audit_1)

        session.commit()
        print("[OutbreakIQ DB] Successfully initialized and seeded OutbreakIQ database!")

    except Exception as e:
        session.rollback()
        print(f"[OutbreakIQ DB ERROR] Failed to initialize database: {e}", file=sys.stderr)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    init_and_seed_database()
