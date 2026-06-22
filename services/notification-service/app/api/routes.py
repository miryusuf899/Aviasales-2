from datetime import UTC, datetime

from fastapi import APIRouter

from app.schemas.notification import EmailRequest, NotificationEvent, SendResult, TelegramRequest
from app.services.email import send_email
from app.services.telegram import send_telegram
from aviakit.errors import AppError

router = APIRouter(tags=["notifications"])


@router.post("/send-email", response_model=SendResult)
async def send_email_endpoint(payload: EmailRequest) -> SendResult:
    await send_email(payload.to_email, payload.subject, payload.message)
    return SendResult(status="sent", channel="email", recipient=payload.to_email)


@router.post("/send-telegram", response_model=SendResult)
async def send_telegram_endpoint(payload: TelegramRequest) -> SendResult:
    await send_telegram(payload.chat_id, payload.message)
    return SendResult(status="sent", channel="telegram", recipient=payload.chat_id)


@router.post("/events", response_model=list[SendResult])
async def accept_event(payload: NotificationEvent) -> list[SendResult]:
    results: list[SendResult] = []
    await send_email(payload.user_email, "Airline Booking", payload.message)
    results.append(SendResult(status="sent", channel="email", recipient=payload.user_email))
    if payload.telegram_chat_id:
        await send_telegram(payload.telegram_chat_id, payload.message)
        results.append(
            SendResult(status="sent", channel="telegram", recipient=payload.telegram_chat_id)
        )
    return results


@router.get("/templates/{event_type}")
async def preview_template(event_type: str) -> NotificationEvent:
    allowed = {"booking_created", "payment_success", "payment_failed", "booking_cancelled"}
    if event_type not in allowed:
        raise AppError("UNKNOWN_EVENT_TYPE", "Неизвестный тип уведомления", 404)
    return NotificationEvent(
        event_type=event_type,
        user_email="user@example.com",
        telegram_chat_id="123456789",
        message=f"Событие {event_type} обработано",
        created_at=datetime.now(UTC),
    )
