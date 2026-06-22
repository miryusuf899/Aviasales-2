from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class AirportCreate(BaseModel):
    code: str = Field(min_length=3, max_length=3)
    city: str
    country: str


class AirportOut(AirportCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int


class FlightCreate(BaseModel):
    flight_number: str
    from_airport_id: int
    to_airport_id: int
    departure_time: datetime
    arrival_time: datetime
    available_seats: int = Field(ge=0)
    price: Decimal = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)


class FlightUpdate(BaseModel):
    flight_number: str | None = None
    from_airport_id: int | None = None
    to_airport_id: int | None = None
    departure_time: datetime | None = None
    arrival_time: datetime | None = None
    available_seats: int | None = Field(default=None, ge=0)
    price: Decimal | None = Field(default=None, gt=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)


class SeatsPatch(BaseModel):
    delta: int


class FlightOut(BaseModel):
    id: int
    flight_number: str
    from_airport: str
    to_airport: str
    departure_time: datetime
    arrival_time: datetime
    available_seats: int
    price: Decimal
    currency: str
