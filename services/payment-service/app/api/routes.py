from uuid import uuid4

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_session
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentOut
from app.services.booking_client import update_booking_status
from app.services.events import publish_payment_event
from aviakit.errors import AppError
from aviakit.security import bearer_token, decode_token

router = APIRouter(tags=["payments"])


def require_authenticated(authorization: str | None = Header(default=None)) -> None:
    decode_token(
        bearer_token(authorization),
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


async def get_payment_model(session: AsyncSession, payment_id: int) -> Payment:
    payment = await session.get(Payment, payment_id)
    if not payment:
        raise AppError("PAYMENT_NOT_FOUND", "Платёж с указанным ID не найден", 404)
    return payment


@router.post("/payments", response_model=PaymentOut, status_code=201)
async def create_payment(
    payload: PaymentCreate,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    _: None = Depends(require_authenticated),
    session: AsyncSession = Depends(get_session),
) -> Payment:
    if idempotency_key:
        existing = await session.scalar(
            select(Payment).where(Payment.idempotency_key == idempotency_key)
        )
        if existing:
            return existing

    status = "success" if payload.simulate_success else "failed"
    payment = Payment(
        booking_id=payload.booking_id,
        amount=payload.amount,
        status=status,
        payment_method=payload.payment_method,
        transaction_id=f"txn_{uuid4().hex}",
        idempotency_key=idempotency_key,
    )
    session.add(payment)
    await session.commit()
    await session.refresh(payment)

    await update_booking_status(
        payload.booking_id,
        "confirmed" if status == "success" else "payment_failed",
    )
    await publish_payment_event(
        "payment_success" if status == "success" else "payment_failed",
        payload.booking_id,
        f"Оплата брони #{payload.booking_id}: {status}",
    )
    return payment


@router.get("/payments/{payment_id}", response_model=PaymentOut)
async def get_payment(
    payment_id: int,
    _: None = Depends(require_authenticated),
    session: AsyncSession = Depends(get_session),
) -> Payment:
    return await get_payment_model(session, payment_id)


@router.get("/payments", response_model=list[PaymentOut])
async def list_payments(
    booking_id: int | None = Query(default=None),
    _: None = Depends(require_authenticated),
    session: AsyncSession = Depends(get_session),
) -> list[Payment]:
    stmt = select(Payment).order_by(Payment.created_at.desc())
    if booking_id is not None:
        stmt = stmt.where(Payment.booking_id == booking_id)
    return list((await session.scalars(stmt)).all())
