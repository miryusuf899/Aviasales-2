from datetime import timedelta

from app.core.config import settings
from app.models.user import User
from aviakit.security import create_token


def issue_tokens(user: User) -> dict[str, str]:
    access_token = create_token(
        subject=str(user.id),
        email=user.email,
        role=user.role,
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        token_type="access",
    )
    refresh_token = create_token(
        subject=str(user.id),
        email=user.email,
        role=user.role,
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
        token_type="refresh",
    )
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
