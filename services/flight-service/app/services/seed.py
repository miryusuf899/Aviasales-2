from datetime import UTC, datetime
from decimal import Decimal

from app.models.flight import Airport, Flight


def sample_data() -> tuple[list[Airport], list[Flight]]:
    dyu = Airport(code="DYU", city="Dushanbe", country="Tajikistan")
    ist = Airport(code="IST", city="Istanbul", country="Turkey")
    dxb = Airport(code="DXB", city="Dubai", country="UAE")
    flights = [
        Flight(
            flight_number="TJ101",
            from_airport=dyu,
            to_airport=ist,
            departure_time=datetime(2026, 7, 1, 8, 0, tzinfo=UTC),
            arrival_time=datetime(2026, 7, 1, 11, 30, tzinfo=UTC),
            available_seats=20,
            price=Decimal("250.00"),
            currency="USD",
        ),
        Flight(
            flight_number="TJ202",
            from_airport=dyu,
            to_airport=dxb,
            departure_time=datetime(2026, 7, 2, 9, 0, tzinfo=UTC),
            arrival_time=datetime(2026, 7, 2, 12, 45, tzinfo=UTC),
            available_seats=15,
            price=Decimal("300.00"),
            currency="USD",
        ),
    ]
    return [dyu, ist, dxb], flights
