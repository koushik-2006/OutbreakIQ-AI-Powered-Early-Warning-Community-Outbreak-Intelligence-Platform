from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str,
        code: str = "ERROR",
        extra: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.code = code
        self.extra = extra or {}


class EntityNotFoundError(AppException):
    def __init__(self, entity: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity} with identifier '{identifier}' not found.",
            code="ENTITY_NOT_FOUND",
            extra={"entity": entity, "identifier": str(identifier)},
        )


class DataValidationError(AppException):
    def __init__(self, message: str, extra: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=message,
            code="DATA_VALIDATION_ERROR",
            extra=extra,
        )


class PrivacySuppressionError(AppException):
    def __init__(self, count: int, threshold: int):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Record violates privacy threshold: aggregate count {count} is below the minimum threshold ({threshold}) and cannot be disclosed.",
            code="PRIVACY_SUPPRESSED",
            extra={"count": count, "threshold": threshold},
        )


class IdentifiableDataRejectedError(AppException):
    def __init__(self, field_name: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Identifiable patient data rejected: field '{field_name}' detected. Only authorized aggregate signals are accepted.",
            code="PII_DETECTED",
            extra={"rejected_field": field_name},
        )


class DuplicateAlertError(AppException):
    def __init__(self, region_id: str, indicator: str, cooldown_hours: int):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An active alert for region '{region_id}' and indicator '{indicator}' already exists within the {cooldown_hours}-hour cooldown window.",
            code="DUPLICATE_ALERT",
            extra={"region_id": region_id, "indicator": indicator, "cooldown_hours": cooldown_hours},
        )


class AuthenticationError(AppException):
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            code="AUTHENTICATION_FAILED",
        )


class PermissionDeniedError(AppException):
    def __init__(self, required_role: str):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Required role: {required_role}.",
            code="PERMISSION_DENIED",
            extra={"required_role": required_role},
        )


class InsufficientDataError(AppException):
    def __init__(self, available: int, required: int):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient historical data to compute baseline: {available} observations available, but minimum {required} required.",
            code="INSUFFICIENT_DATA",
            extra={"available": available, "required": required},
        )
