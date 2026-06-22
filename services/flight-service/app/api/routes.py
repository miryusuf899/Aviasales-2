from datetime import date, datetime, time

from fastapi import APIRouter, Depends, Header, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import Select, and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_session
from app.models.flight import Airport, Flight
from app.schemas.flight import AirportCreate, AirportOut, FlightCreate, FlightOut, FlightUpdate, SeatsPatch
from aviakit.errors import AppError, ErrorResponse
from aviakit.security import bearer_token, decode_token

router = APIRouter(tags=["flights"])
bearer_scheme = HTTPBearer(auto_error=False)


def authorization_value(credentials: HTTPAuthorizationCredentials | None) -> str | None:
    return f"{credentials.scheme} {credentials.credentials}" if credentials else None


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> None:
    payload = decode_token(
        bearer_token(authorization_value(credentials)),
        secret_key=settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    if payload.get("role") != "admin":
        raise AppError("FORBIDDEN", "Доступ разрешён только администратору", 403)


def require_admin_or_internal(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    x_internal_token: str | None = Header(default=None, alias="X-Internal-Token"),
) -> None:
    if x_internal_token == settings.internal_service_token:
        return
    require_admin(credentials)


def flight_out(flight: Flight) -> FlightOut:
    return FlightOut(
        id=flight.id,
        flight_number=flight.flight_number,
        from_airport=flight.from_airport.code,
        to_airport=flight.to_airport.code,
        departure_time=flight.departure_time,
        arrival_time=flight.arrival_time,
        available_seats=flight.available_seats,
        price=flight.price,
        currency=flight.currency,
    )


async def get_airport(session: AsyncSession, airport_id: int) -> Airport:
    airport = await session.get(Airport, airport_id)
    if not airport:
        raise AppError("AIRPORT_NOT_FOUND", "Аэропорт с указанным ID не найден", 404)
    return airport


async def get_flight_model(session: AsyncSession, flight_id: int) -> Flight:
    flight = await session.get(Flight, flight_id)
    if not flight:
        raise AppError("FLIGHT_NOT_FOUND", "Рейс с указанным ID не найден", 404)
    return flight


@router.post("/airports", response_model=AirportOut, status_code=201)
async def create_airport(
    payload: AirportCreate,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> Airport:
    airport = Airport(code=payload.code.upper(), city=payload.city, country=payload.country)
    session.add(airport)
    await session.commit()
    await session.refresh(airport)
    return airport


@router.get("/airports", response_model=list[AirportOut])
async def list_airports(session: AsyncSession = Depends(get_session)) -> list[Airport]:
    return list((await session.scalars(select(Airport).order_by(Airport.code))).all())


@router.post("/flights", response_model=FlightOut, status_code=201)
async def create_flight(
    payload: FlightCreate,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> FlightOut:
    await get_airport(session, payload.from_airport_id)
    await get_airport(session, payload.to_airport_id)
    flight = Flight(**payload.model_dump())
    session.add(flight)
    await session.commit()
    await session.refresh(flight, attribute_names=["from_airport", "to_airport"])
    return flight_out(flight)


@router.get("/flights", response_model=list[FlightOut])
async def search_flights(
    from_airport: str | None = Query(default=None, min_length=3, max_length=3),
    to_airport: str | None = Query(default=None, min_length=3, max_length=3),
    departure_date: date | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
) -> list[FlightOut]:
    stmt: Select[tuple[Flight]] = select(Flight).order_by(Flight.departure_time).offset(skip).limit(limit)
    filters = []
    if from_airport:
        stmt = stmt.join(Flight.from_airport)
        filters.append(Airport.code == from_airport.upper())
    if to_airport:
        to_alias = Airport.__table__.alias("to_airports")
        stmt = stmt.join(to_alias, Flight.to_airport_id == to_alias.c.id)
        filters.append(to_alias.c.code == to_airport.upper())
    if departure_date:
        start = datetime.combine(departure_date, time.min)
        end = datetime.combine(departure_date, time.max)
        filters.append(and_(Flight.departure_time >= start, Flight.departure_time <= end))
    if filters:
        stmt = stmt.where(*filters)
    return [flight_out(flight) for flight in (await session.scalars(stmt)).unique().all()]


@router.get("/flights/{flight_id}", response_model=FlightOut)
async def get_flight(flight_id: int, session: AsyncSession = Depends(get_session)) -> FlightOut:
    return flight_out(await get_flight_model(session, flight_id))


@router.put("/flights/{flight_id}", response_model=FlightOut)
async def update_flight(
    flight_id: int,
    payload: FlightUpdate,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> FlightOut:
    flight = await get_flight_model(session, flight_id)
    data = payload.model_dump(exclude_unset=True)
    if "from_airport_id" in data:
        await get_airport(session, data["from_airport_id"])
    if "to_airport_id" in data:
        await get_airport(session, data["to_airport_id"])
    for field, value in data.items():
        setattr(flight, field, value)
    await session.commit()
    await session.refresh(flight, attribute_names=["from_airport", "to_airport"])
    return flight_out(flight)


@router.delete("/flights/{flight_id}", status_code=204)
async def delete_flight(
    flight_id: int,
    _: None = Depends(require_admin),
    session: AsyncSession = Depends(get_session),
) -> None:
    flight = await get_flight_model(session, flight_id)
    await session.delete(flight)
    await session.commit()


@router.patch(
    "/flights/{flight_id}/seats",
    response_model=FlightOut,
    responses={409: {"model": ErrorResponse}},
)
async def change_seats(
    flight_id: int,
    payload: SeatsPatch,
    _: None = Depends(require_admin_or_internal),
    session: AsyncSession = Depends(get_session),
) -> FlightOut:
    result = await session.execute(
        update(Flight)
        .where(Flight.id == flight_id, Flight.available_seats + payload.delta >= 0)
        .values(available_seats=Flight.available_seats + payload.delta)
        .returning(Flight.id)
    )
    updated_id = result.scalar_one_or_none()
    if updated_id is None:
        if await session.get(Flight, flight_id) is None:
            raise AppError("FLIGHT_NOT_FOUND", "Рейс с указанным ID не найден", 404)
        raise AppError("NO_AVAILABLE_SEATS", "Недостаточно свободных мест на рейсе", 409)
    await session.commit()
    return flight_out(await get_flight_model(session, flight_id))
