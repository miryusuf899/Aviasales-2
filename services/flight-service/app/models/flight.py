from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from aviakit.db import Base


class Airport(Base):
    __tablename__ = "airports"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(3), unique=True, index=True)
    city: Mapped[str] = mapped_column(String(100))
    country: Mapped[str] = mapped_column(String(100))


class Flight(Base):
    __tablename__ = "flights"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    flight_number: Mapped[str] = mapped_column(String(20), index=True)
    from_airport_id: Mapped[int] = mapped_column(ForeignKey("airports.id"))
    to_airport_id: Mapped[int] = mapped_column(ForeignKey("airports.id"))
    departure_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    arrival_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    available_seats: Mapped[int]
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    currency: Mapped[str] = mapped_column(String(3), default="USD")

    from_airport: Mapped[Airport] = relationship(foreign_keys=[from_airport_id], lazy="joined")
    to_airport: Mapped[Airport] = relationship(foreign_keys=[to_airport_id], lazy="joined")
