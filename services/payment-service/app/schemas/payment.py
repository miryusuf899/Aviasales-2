from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


PaymentStatus = Literal["pending", "success", "failed"]


class PaymentCreate(BaseModel):
    booking_id: int
    amount: Decimal = Field(gt=0)
    payment_method: str = "card"
    simulate_success: bool = True


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_id: int
    amount: Decimal
    status: PaymentStatus
    payment_method: str
    transaction_id: str
    created_at: datetime
