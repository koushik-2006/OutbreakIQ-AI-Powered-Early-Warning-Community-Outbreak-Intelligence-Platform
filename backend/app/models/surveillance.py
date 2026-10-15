from datetime import date, datetime, timezone
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class RegionModel(Base):
    __tablename__ = "regions"

    id = Column(String(50), primary_key=True)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=False, unique=True, index=True)
    parent_id = Column(String(50), nullable=True)
    population = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    active_alerts_count = Column(Integer, default=0, nullable=False)
    total_observations_count = Column(Integer, default=0, nullable=False)
    last_signal_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    observations = relationship("ObservationModel", back_populates="region", cascade="all, delete-orphan")
    alerts = relationship("AlertModel", back_populates="region", cascade="all, delete-orphan")
    investigations = relationship("InvestigationModel", back_populates="region", cascade="all, delete-orphan")


class DataSourceModel(Base):
    __tablename__ = "data_sources"

    id = Column(String(50), primary_key=True)
    name = Column(String(150), nullable=False)
    source_type = Column(String(50), nullable=False)
    indicator = Column(String(50), nullable=False, index=True)
    frequency = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_simulated = Column(Boolean, default=False, nullable=False)
    last_received_at = Column(DateTime(timezone=True), nullable=True)
    facility_count = Column(Integer, default=0, nullable=False)
    coverage_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)


class ObservationModel(Base):
    __tablename__ = "observations"

    id = Column(String(50), primary_key=True)
    region_id = Column(String(50), ForeignKey("regions.id", ondelete="CASCADE"), nullable=False, index=True)
    indicator = Column(String(50), nullable=False, index=True)
    reporting_date = Column(Date, nullable=False, index=True)
    count = Column(Integer, nullable=False)
    effective_count = Column(Integer, nullable=True)
    is_suppressed = Column(Boolean, default=False, nullable=False)
    source_id = Column(String(50), nullable=False)
    metadata_json = Column(Text, default="{}", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    region = relationship("RegionModel", back_populates="observations")

    __table_args__ = (
        UniqueConstraint("region_id", "indicator", "reporting_date", "source_id", name="uq_observation_record"),
    )


class AlertModel(Base):
    __tablename__ = "alerts"

    id = Column(String(50), primary_key=True)
    region_id = Column(String(50), ForeignKey("regions.id", ondelete="CASCADE"), nullable=False, index=True)
    region_name = Column(String(150), nullable=False)
    indicator = Column(String(50), nullable=False, index=True)
    reporting_date = Column(Date, nullable=False, index=True)
    observed_value = Column(Integer, nullable=False)
    baseline_expected = Column(Float, nullable=False)
    deviation_score = Column(Float, nullable=False)
    severity = Column(String(20), nullable=False, index=True)
    confidence = Column(String(20), nullable=False)
    explanation = Column(Text, nullable=False)
    evidence_summary = Column(Text, nullable=False)
    corroborating_signals_json = Column(Text, default="[]", nullable=False)
    data_quality_notes = Column(Text, nullable=True)
    review_status = Column(String(50), default="PENDING_REVIEW", nullable=False, index=True)
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    region = relationship("RegionModel", back_populates="alerts")
    investigations = relationship("InvestigationModel", back_populates="alert", cascade="all, delete-orphan")


class InvestigationModel(Base):
    __tablename__ = "investigations"

    id = Column(String(50), primary_key=True)
    alert_id = Column(String(50), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(250), nullable=False)
    region_id = Column(String(50), ForeignKey("regions.id", ondelete="CASCADE"), nullable=False, index=True)
    indicator = Column(String(50), nullable=False)
    status = Column(String(50), default="OPEN", nullable=False, index=True)
    outcome = Column(String(50), default="UNDER_EVALUATION", nullable=False)
    assigned_to = Column(String(100), nullable=False)
    created_by = Column(String(100), nullable=False)
    resolution_summary = Column(Text, nullable=True)
    timeline_json = Column(Text, default="[]", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    region = relationship("RegionModel", back_populates="investigations")
    alert = relationship("AlertModel", back_populates="investigations")


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)
    action = Column(String(50), nullable=False)
    actor_username = Column(String(100), nullable=False, index=True)
    target_entity = Column(String(50), nullable=False)
    target_id = Column(String(50), nullable=False)
    details = Column(Text, nullable=False)
