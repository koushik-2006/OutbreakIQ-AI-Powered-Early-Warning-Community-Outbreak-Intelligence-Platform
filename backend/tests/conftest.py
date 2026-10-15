import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.main import app
from app.utils.enums import UserRole


@pytest.fixture(scope="session")
def client():
    """Synchronous test client for API endpoint testing."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def analyst_token() -> str:
    """Valid JWT token for Analyst role."""
    return create_access_token(
        subject="analyst",
        role=UserRole.ANALYST,
        extra_claims={"name": "Test Analyst"},
    )


@pytest.fixture(scope="session")
def epidemiologist_token() -> str:
    """Valid JWT token for Epidemiologist role."""
    return create_access_token(
        subject="dr_chen",
        role=UserRole.EPIDEMIOLOGIST,
        extra_claims={"name": "Dr. Sarah Chen"},
    )


@pytest.fixture(scope="session")
def admin_token() -> str:
    """Valid JWT token for Admin role."""
    return create_access_token(
        subject="admin",
        role=UserRole.ADMIN,
        extra_claims={"name": "System Admin"},
    )


@pytest.fixture(scope="session")
def viewer_token() -> str:
    """Valid JWT token for Viewer role."""
    return create_access_token(
        subject="viewer",
        role=UserRole.VIEWER,
        extra_claims={"name": "Public Viewer"},
    )


@pytest.fixture
def auth_headers(analyst_token: str):
    """Standard Bearer auth headers for analyst."""
    return {"Authorization": f"Bearer {analyst_token}"}
