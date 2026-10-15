from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.utils.enums import AuditAction, UserRole


class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    role: UserRole
    username: str
    token: Optional[str] = None
    user: Optional[object] = None


class UserResponse(BaseModel):
    username: str
    role: UserRole
    full_name: str
    email: Optional[str] = None
    is_active: bool = True


class AuditLogEntry(BaseModel):
    id: str
    timestamp: datetime
    action: AuditAction
    actor_username: str
    target_entity: str
    target_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None


class AuditLogFilter(BaseModel):
    action: Optional[AuditAction] = None
    actor_username: Optional[str] = None
    target_entity: Optional[str] = None
