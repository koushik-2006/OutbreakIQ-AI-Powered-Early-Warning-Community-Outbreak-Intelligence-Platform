from fastapi import APIRouter, Depends

from app.core.config import settings
from app.core.exceptions import AuthenticationError
from app.core.permissions import AuthenticatedUser, get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.utils.enums import UserRole

router = APIRouter()

# Prototype user store with securely pre-hashed passwords
# Allows out-of-the-box team testing prior to teammate's user table deployment
PROTOTYPE_USERS = {
    "analyst": {
        "username": "analyst",
        "hashed_password": hash_password("analyst123"),
        "role": UserRole.ANALYST,
        "full_name": "Senior Data Analyst",
        "email": "analyst@outbreakiq.internal",
    },
    "dr_chen": {
        "username": "dr_chen",
        "hashed_password": hash_password("epidemiologist123"),
        "role": UserRole.EPIDEMIOLOGIST,
        "full_name": "Dr. Sarah Chen (Chief Epidemiologist)",
        "email": "schen@outbreakiq.internal",
    },
    "admin": {
        "username": "admin",
        "hashed_password": hash_password("admin123"),
        "role": UserRole.ADMIN,
        "full_name": "Surveillance System Admin",
        "email": "admin@outbreakiq.internal",
    },
    "viewer": {
        "username": "viewer",
        "hashed_password": hash_password("viewer123"),
        "role": UserRole.VIEWER,
        "full_name": "Public Health Stakeholder",
        "email": "viewer@outbreakiq.internal",
    },
}


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User Login",
    description="Authenticate with username and password to obtain a signed JWT bearer token.",
)
async def login(credentials: LoginRequest):
    identifier = (credentials.username or credentials.email or "").strip().lower()
    if not identifier:
        raise AuthenticationError("Username or email is required")

    user_record = PROTOTYPE_USERS.get(identifier)
    if not user_record:
        for u in PROTOTYPE_USERS.values():
            if u.get("email", "").lower() == identifier:
                user_record = u
                break

    if not user_record:
        raise AuthenticationError("Invalid username or password")

    if not verify_password(credentials.password, user_record["hashed_password"]):
        raise AuthenticationError("Invalid username or password")

    role: UserRole = user_record["role"]
    token = create_access_token(
        subject=user_record["username"],
        role=role,
        extra_claims={"name": user_record["full_name"]},
    )

    user_data = {
        "id": f"usr-{user_record['username']}",
        "name": user_record["full_name"],
        "email": user_record.get("email", f"{user_record['username']}@outbreakiq.internal"),
        "role": user_record["username"] if user_record["username"] in ["analyst", "admin", "viewer"] else "epidemiologist",
        "organization": "Community Health Surveillance Network",
        "department": "Epidemic Intelligence & Early Warning",
        "lastLogin": "Just now",
    }

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        role=role,
        username=user_record["username"],
        token=token,
        user=user_data,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Current User Profile",
    description="Retrieve details of the authenticated caller from the JWT bearer token.",
)
async def get_current_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    user_record = PROTOTYPE_USERS.get(current_user.username)
    email = user_record.get("email") if user_record else None
    return UserResponse(
        username=current_user.username,
        role=current_user.role,
        full_name=current_user.full_name,
        email=email,
        is_active=True,
    )
