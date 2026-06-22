from fastapi import APIRouter, Depends, Header, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_session
from app.models.booking import Booking
from app.schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate
from app.services.clients import change_flight_seats, get_flight, get_user, total_price
from app.services.events import publish_notification_event
from aviakit.errors import AppError, ErrorResponse
from aviakit.security import bearer_token, decode_token

router = APIRouter(tags=["bookings"])
bearer_scheme = HTTPBearer(auto_error=False)


def authorization_value(credentials: HTTPAuthorizationCredentials | None) -> str | None:
    return f"{credentials.scheme} {credentials.credentials}" if credentials else None


def identity_from_request(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
) -> tuple[int, str]:
    header_user_id = request.headers.get("x-user-id")
    authorization = authorization_value(credentials)
    if header_user_id and not authorization:
        raise AppError("AUTH_REQUIRED", "Требуется Bearer-токен", 401)
    payload = decode_token(
        bearer_token(authorization),
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    return int(payload["sub"]), payload.get("role", "passenger")


async def get_booking_model(session: AsyncSession, booking_id: int) -> Booking:
    booking = await session.get(Booking, booking_id)
    if not booking:
        raise AppError("BOOKING_NOT_FOUND", "Бронирование с указанным ID не найдено", 404)
    return booking


@router.post(
    "/bookings",
    response_model=BookingOut,
    responses={404: {"model": ErrorResponse}, 409: {"model": ErrorResponse}},
    status_code=201,
)
async def create_booking(
    payload: BookingCreate,
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> Booking:
    current_user_id, role = identity_from_request(request, credentials)
    user_id = payload.user_id or current_user_id
    if user_id != current_user_id and role != "admin":
        raise AppError("FORBIDDEN", "Нельзя создать бронь для другого пользователя", 403)

    user = await get_user(user_id)
    flight = await get_flight(payload.flight_id)
    if flight["available_seats"] < payload.seats_booked:
        raise AppError("NO_AVAILABLE_SEATS", "Недостаточно свободных мест на рейсе", 409)

    await change_flight_seats(payload.flight_id, -payload.seats_booked)
    booking = Booking(
        user_id=user_id,
        flight_id=payload.flight_id,
        status="pending",
        seats_booked=payload.seats_booked,
        total_price=total_price(flight["price"], payload.seats_booked),
    )
    session.add(booking)
    try:
        await session.commit()
    except Exception:
        await session.rollback()
        await change_flight_seats(payload.flight_id, payload.seats_booked)
        raise
    await session.refresh(booking)
    await publish_notification_event(
        "booking_created",
        user_email=user["email"],
        message=f"Ваша бронь #{booking.id} создана",
    )
    return booking


@router.get("/bookings", response_model=list[BookingOut])
async def list_bookings(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> list[Booking]:
    user_id, role = identity_from_request(request, credentials)
    stmt = select(Booking).order_by(Booking.created_at.desc())
    if role != "admin":
        stmt = stmt.where(Booking.user_id == user_id)
    return list((await session.scalars(stmt)).all())


@router.get("/bookings/{booking_id}", response_model=BookingOut)
async def get_booking(
    booking_id: int,
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> Booking:
    user_id, role = identity_from_request(request, credentials)
    booking = await get_booking_model(session, booking_id)
    if booking.user_id != user_id and role != "admin":
        raise AppError("FORBIDDEN", "Нет доступа к этому бронированию", 403)
    return booking


@router.delete("/bookings/{booking_id}", response_model=BookingOut)
async def cancel_booking(
    booking_id: int,
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> Booking:
    user_id, role = identity_from_request(request, credentials)
    booking = await get_booking_model(session, booking_id)
    if booking.user_id != user_id and role != "admin":
        raise AppError("FORBIDDEN", "Нет доступа к этому бронированию", 403)
    if booking.status == "cancelled":
        return booking

    booking.status = "cancelled"
    await change_flight_seats(booking.flight_id, booking.seats_booked)
    await session.commit()
    await session.refresh(booking)
    await publish_notification_event(
        "booking_cancelled",
        user_email="unknown@example.com",
        message=f"Бронь #{booking.id} отменена",
    )
    return booking


@router.patch("/bookings/{booking_id}/status", response_model=BookingOut)
async def update_status(
    booking_id: int,
    payload: BookingStatusUpdate,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    x_internal_token: str | None = Header(default=None, alias="X-Internal-Token"),
    session: AsyncSession = Depends(get_session),
) -> Booking:
    if x_internal_token != settings.internal_service_token:
        authorization = authorization_value(credentials)
        payload_token = decode_token(
            bearer_token(authorization),
            secret_key=settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )
        if payload_token.get("role") != "admin":
            raise AppError("FORBIDDEN", "Доступ разрешён только администратору", 403)
    booking = await get_booking_model(session, booking_id)
    booking.status = payload.status
    await session.commit()
    await session.refresh(booking)
    return booking
