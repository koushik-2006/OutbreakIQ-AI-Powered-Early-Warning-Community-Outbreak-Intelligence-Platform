from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.endpoints.health import router as unversioned_health_router
from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.schemas.common import ErrorDetail, ErrorResponse


def create_application() -> FastAPI:
    """FastAPI Application Factory."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description=(
            "OutbreakIQ Early Warning Community Outbreak Intelligence Platform Backend. "
            "Provides privacy-preserving health signal ingestion, rolling baseline calculations, "
            "statistical anomaly detection, cross-indicator corroboration, explainable preliminary alerts, "
            "and public health case investigation workflows."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_origin_regex=r"^https?:\/\/.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    async def startup_event():
        try:
            from app.core.database import engine, Base
            import app.models  # noqa: F401
            if engine is not None:
                Base.metadata.create_all(bind=engine)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Could not auto-create database tables on startup: {e}")

    # Unversioned root & health endpoints
    app.include_router(unversioned_health_router, prefix="", tags=["Root"])

    # Versioned API routes (/api/v1/...)
    app.include_router(api_router, prefix=settings.API_V1_STR)

    # Custom Exception Handlers
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content=ErrorResponse(
                success=False,
                error=ErrorDetail(
                    code=exc.code,
                    message=exc.detail,
                    extra=exc.extra or None,
                ),
            ).model_dump(mode="json"),
        )

    @app.get("/", tags=["Root"])
    async def root():
        return {
            "service": settings.PROJECT_NAME,
            "status": "online",
            "documentation": "/docs",
            "health": "/health",
            "api_v1": settings.API_V1_STR,
        }

    return app


app = create_application()
