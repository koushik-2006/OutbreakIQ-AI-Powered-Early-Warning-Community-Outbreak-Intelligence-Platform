from typing import List
from fastapi import APIRouter

from app.core.exceptions import EntityNotFoundError
from app.schemas.data_source import DataSourceResponse
from app.services.source_health_service import source_health_service

router = APIRouter()


@router.get(
    "",
    response_model=List[DataSourceResponse],
    summary="List Data Sources",
    description="Retrieve all configured aggregate surveillance feeds, their update freshness, and simulation status.",
)
async def list_data_sources():
    return source_health_service.list_sources()


@router.get(
    "/{id}",
    response_model=DataSourceResponse,
    summary="Get Data Source Details",
    description="Retrieve operational health and metadata for a specific surveillance feed.",
)
async def get_data_source(id: str):
    source = source_health_service.get_source_by_id(id)
    if not source:
        raise EntityNotFoundError(entity="DataSource", identifier=id)
    return source
