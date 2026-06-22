from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


BookingStatus = Literal["pending", "confirmed", "payment_failed", "cancelled"]


class BookingCreate(BaseModel):
    flight_id: int
    seats_booked: int = Field(default=1, ge=1)
    user_id: int | None = None


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    flight_id: int
    status: BookingStatus
    seats_booked: int
    total_price: Decimal
    created_at: datetime


class BookingStatusUpdate(BaseModel):
    status: BookingStatus
