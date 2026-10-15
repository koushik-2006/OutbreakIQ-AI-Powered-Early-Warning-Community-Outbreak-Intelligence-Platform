from typing import Dict, List, Optional
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AuthenticationError, PermissionDeniedError
from app.core.security import decode_access_token
from app.utils.enums import UserRole

# Standard bearer auth scheme
security_scheme = HTTPBearer(auto_error=False)

# Seeded prototype users with roles and credentials
# For testing and role verification before teammate's user table arrives
ROLE_HIERARCHY: Dict[UserRole, int] = {
    UserRole.VIEWER: 1,
    UserRole.ANALYST: 2,
    UserRole.EPIDEMIOLOGIST: 3,
    UserRole.ADMIN: 4,
}


class AuthenticatedUser:
    def __init__(self, username: str, role: UserRole, full_name: Optional[str] = None):
        self.username = username
        self.role = role
        self.full_name = full_name or username

    def has_role(self, required_role: UserRole) -> bool:
        user_level = ROLE_HIERARCHY.get(self.role, 0)
        required_level = ROLE_HIERARCHY.get(required_role, 0)
        return user_level >= required_level


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
) -> AuthenticatedUser:
    """Extract and validate user from Bearer JWT token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    username: str = payload.get("sub")
    role_str: str = payload.get("role", UserRole.VIEWER.value)

    if not username:
        raise AuthenticationError("Token payload missing subject")

    try:
        role = UserRole(role_str)
    except ValueError:
        role = UserRole.VIEWER

    return AuthenticatedUser(
        username=username,
        role=role,
        full_name=payload.get("name", username),
    )


def require_role(required_role: UserRole):
    """Dependency factory checking that the current user has the required role or higher."""
    async def role_checker(
        current_user: AuthenticatedUser = Depends(get_current_user),
    ) -> AuthenticatedUser:
        if not current_user.has_role(required_role):
            raise PermissionDeniedError(required_role=required_role.value)
        return current_user

    return role_checker


# Convenient role dependencies
require_viewer = require_role(UserRole.VIEWER)
require_analyst = require_role(UserRole.ANALYST)
require_epidemiologist = require_role(UserRole.EPIDEMIOLOGIST)
require_admin = require_role(UserRole.ADMIN)
