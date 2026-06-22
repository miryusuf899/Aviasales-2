from fastapi import APIRouter, Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_session
from app.models.user import User
from app.schemas.user import LoginRequest, TokenPair, UserCreate, UserOut, UserUpdate
from app.services.auth import issue_tokens
from aviakit.errors import AppError, ErrorResponse
from aviakit.security import bearer_token, decode_token, hash_password, verify_password

router = APIRouter(tags=["users"])


async def user_by_id(session: AsyncSession, user_id: int) -> User:
    user = await session.get(User, user_id)
    if not user:
        raise AppError("USER_NOT_FOUND", "Пользователь с указанным ID не найден", 404)
    return user


async def current_user(
    authorization: str | None = Header(default=None),
    session: AsyncSession = Depends(get_session),
) -> User:
    payload = decode_token(
        bearer_token(authorization),
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    return await user_by_id(session, int(payload["sub"]))


@router.post(
    "/register",
    response_model=UserOut,
    responses={409: {"model": ErrorResponse}},
    status_code=201,
)
async def register(payload: UserCreate, session: AsyncSession = Depends(get_session)) -> User:
    existing = await session.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise AppError("EMAIL_ALREADY_REGISTERED", "Пользователь с таким email уже существует", 409)

    user = User(
        email=str(payload.email),
        hashed_password=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone=payload.phone,
        role="passenger",
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)) -> dict[str, str]:
    user = await session.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise AppError("INVALID_CREDENTIALS", "Неверный email или пароль", 401)
    return issue_tokens(user)


@router.post("/refresh", response_model=TokenPair)
async def refresh(
    authorization: str | None = Header(default=None),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    payload = decode_token(
        bearer_token(authorization),
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    if payload.get("type") != "refresh":
        raise AppError("INVALID_TOKEN_TYPE", "Ожидался refresh-токен", 401)
    user = await user_by_id(session, int(payload["sub"]))
    return issue_tokens(user)


@router.get("/users/me", response_model=UserOut)
async def me(user: User = Depends(current_user)) -> User:
    return user


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, session: AsyncSession = Depends(get_session)) -> User:
    return await user_by_id(session, user_id)


@router.put("/users/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    current: User = Depends(current_user),
    session: AsyncSession = Depends(get_session),
) -> User:
    if current.id != user_id and current.role != "admin":
        raise AppError("FORBIDDEN", "Недостаточно прав для обновления профиля", 403)

    user = await user_by_id(session, user_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await session.commit()
    await session.refresh(user)
    return user
