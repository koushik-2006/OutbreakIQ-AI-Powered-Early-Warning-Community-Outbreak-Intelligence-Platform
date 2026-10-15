import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.core.config import settings

logger = logging.getLogger(__name__)

# Base class for SQLAlchemy ORM models (teammate's models will extend this)
Base = declarative_base()

# Engine setup
engine = None
SessionLocal = None

try:
    connect_args = {}
    if settings.DATABASE_URL.startswith("sqlite"):
        connect_args = {"check_same_thread": False}

    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True,
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    logger.warning(f"Could not initialize database engine with URL '{settings.DATABASE_URL}': {e}")


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a database session.
    Closes the session when the request is completed.
    """
    if SessionLocal is None:
        raise RuntimeError("Database engine is not configured.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """Verifies whether the database is accessible.
    Used by health-check endpoints.
    """
    if engine is None:
        return {"status": "unconfigured", "error": "Database engine not initialized"}
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "connected", "url": settings.DATABASE_URL.split("@")[-1]}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "disconnected", "error": str(e)}
