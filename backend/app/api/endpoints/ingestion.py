from typing import Dict, List
from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.core.permissions import AuthenticatedUser, require_analyst
from app.repositories.observation_repository import observation_repository
from app.schemas.observation import (
    ObservationBatchCreate,
    ObservationResponse,
)
from app.services.audit_service import audit_service
from app.services.validation_service import validation_service
from app.utils.enums import AuditAction

router = APIRouter()


@router.post(
    "/csv",
    summary="Ingest Aggregate Observations via CSV",
    description="Upload a CSV file containing authorized aggregate observations (region_id, indicator, reporting_date, count). Rejects any individual patient identifiers and applies privacy suppression to small counts.",
)
async def ingest_csv(
    file: UploadFile = File(..., description="CSV file with aggregate surveillance data"),
    source_id: str = Form("SRC-UPLOAD", description="Identifier of the reporting source feed"),
    current_user: AuthenticatedUser = Depends(require_analyst),
) -> Dict:
    content = await file.read()
    validated_records = validation_service.validate_csv_content(content, source_id=source_id)

    # Ingest records
    created_items: List[ObservationResponse] = []
    suppressed_count = 0

    for obs, is_suppressed, eff_count in validated_records:
        if is_suppressed:
            suppressed_count += 1
        created = observation_repository.create(
            observation=obs,
            is_suppressed=is_suppressed,
            effective_count=eff_count,
        )
        created_items.append(created)

    # Record audit log
    audit_service.record_event(
        action=AuditAction.DATA_INGESTION,
        actor_username=current_user.username,
        target_entity="Observation",
        details=f"CSV upload '{file.filename}': {len(created_items)} aggregate records ingested, {suppressed_count} cells suppressed for privacy.",
    )

    return {
        "success": True,
        "message": f"Successfully ingested {len(created_items)} aggregate observations from CSV.",
        "total_records": len(created_items),
        "privacy_suppressed_cells": suppressed_count,
        "source_id": source_id,
    }


@router.post(
    "/batch",
    response_model=List[ObservationResponse],
    summary="Batch Ingestion (JSON)",
    description="Submit a batch of validated aggregate health observations in JSON format.",
)
async def ingest_batch(
    payload: ObservationBatchCreate,
    current_user: AuthenticatedUser = Depends(require_analyst),
):
    validated_batch = []
    for obs in payload.observations:
        v_obs, is_suppressed, eff_count = validation_service.validate_observation(
            obs, check_duplicate=False
        )
        validated_batch.append((v_obs, is_suppressed, eff_count))

    results = observation_repository.create_batch(validated_batch)

    audit_service.record_event(
        action=AuditAction.DATA_INGESTION,
        actor_username=current_user.username,
        target_entity="Observation",
        details=f"Batch JSON ingestion: {len(results)} records ingested.",
    )
    return results
