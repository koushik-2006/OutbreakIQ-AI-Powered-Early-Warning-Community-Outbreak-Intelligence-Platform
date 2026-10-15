from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
except ImportError:
    from pydantic import BaseModel as BaseSettings  # type: ignore
    SettingsConfigDict = dict  # type: ignore


class Settings(BaseSettings):
    PROJECT_NAME: str = "OutbreakIQ Early Warning Backend"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

    # Teammate Database Connection URL
    # Can point to Postgres when teammate delivers schema:
    # "postgresql+psycopg://postgres:postgres@localhost:5432/outbreakiq"
    DATABASE_URL: str = "sqlite:///./outbreakiq.db"

    # Security & Auth
    JWT_SECRET_KEY: str = "outbreakiq-super-secret-key-change-in-production-2025"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Privacy Protection
    # Aggregated health counts below this threshold are strictly suppressed to prevent re-identification
    PRIVACY_MIN_COUNT_THRESHOLD: int = 5

    # Anomaly Detection & Baseline Defaults
    BASELINE_HISTORICAL_DAYS: int = 28
    MIN_OBSERVATIONS_FOR_BASELINE: int = 7
    ANOMALY_ZSCORE_THRESHOLD: float = 2.0
    DUPLICATE_ALERT_COOLDOWN_HOURS: int = 24

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
