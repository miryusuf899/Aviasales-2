from datetime import UTC, datetime
from decimal import Decimal

from app.models.flight import Airport, Flight


def sample_data() -> tuple[list[Airport], list[Flight]]:
    dyu = Airport(code="DYU", city="Dushanbe", country="Tajikistan")
    ist = Airport(code="IST", city="Istanbul", country="Turkey")
    dxb = Airport(code="DXB", city="Dubai", country="UAE")
    jfk = Airport(code="JFK", city="New York", country="United States")
    cdg = Airport(code="CDG", city="Paris", country="France")
    lhr = Airport(code="LHR", city="London", country="United Kingdom")
    nrt = Airport(code="NRT", city="Tokyo", country="Japan")
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
        Flight(
            flight_number="AF337",
            from_airport=jfk,
            to_airport=cdg,
            departure_time=datetime(2026, 7, 12, 20, 20, tzinfo=UTC),
            arrival_time=datetime(2026, 7, 13, 9, 50, tzinfo=UTC),
            available_seats=42,
            price=Decimal("399.00"),
            currency="USD",
        ),
        Flight(
            flight_number="UA57",
            from_airport=jfk,
            to_airport=cdg,
            departure_time=datetime(2026, 7, 12, 18, 10, tzinfo=UTC),
            arrival_time=datetime(2026, 7, 13, 7, 25, tzinfo=UTC),
            available_seats=18,
            price=Decimal("429.00"),
            currency="USD",
        ),
        Flight(
            flight_number="LH401",
            from_airport=jfk,
            to_airport=lhr,
            departure_time=datetime(2026, 7, 13, 17, 30, tzinfo=UTC),
            arrival_time=datetime(2026, 7, 14, 5, 45, tzinfo=UTC),
            available_seats=31,
            price=Decimal("459.00"),
            currency="USD",
        ),
        Flight(
            flight_number="EK204",
            from_airport=jfk,
            to_airport=dxb,
            departure_time=datetime(2026, 7, 14, 11, 20, tzinfo=UTC),
            arrival_time=datetime(2026, 7, 15, 8, 10, tzinfo=UTC),
            available_seats=27,
            price=Decimal("689.00"),
            currency="USD",
        ),
        Flight(
            flight_number="QR702",
            from_airport=jfk,
            to_airport=nrt,
            departure_time=datetime(2026, 7, 15, 13, 5, tzinfo=UTC),
            arrival_time=datetime(2026, 7, 16, 15, 40, tzinfo=UTC),
            available_seats=24,
            price=Decimal("719.00"),
            currency="USD",
        ),
    ]
    return [dyu, ist, dxb, jfk, cdg, lhr, nrt], flights
