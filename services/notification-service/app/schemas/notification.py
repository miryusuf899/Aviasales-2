from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr


EventType = Literal["booking_created", "payment_success", "payment_failed", "booking_cancelled"]


class EmailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    message: str


class TelegramRequest(BaseModel):
    chat_id: str
    message: str


class NotificationEvent(BaseModel):
    event_type: EventType
    user_email: EmailStr
    telegram_chat_id: str | None = None
    message: str
    created_at: datetime


class SendResult(BaseModel):
    status: str
    channel: str
    recipient: str
