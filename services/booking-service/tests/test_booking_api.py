import os
import sys

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
for module in list(sys.modules):
    if module == "app" or module.startswith("app."):
        del sys.modules[module]
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api import routes as routes_module
from app.db import session as db_session
from app.main import app
from aviakit.db import Base
from aviakit.security import create_token


@pytest.fixture()
async def client(monkeypatch):
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    db_session.engine = engine
    db_session.SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def fake_get_user(user_id: int):
        return {"id": user_id, "email": "user@example.com", "role": "passenger"}

    async def fake_get_flight(flight_id: int):
        return {"id": flight_id, "available_seats": 3, "price": "250.00"}

    async def fake_change_flight_seats(flight_id: int, delta: int):
        return {"id": flight_id, "available_seats": 2}

    monkeypatch.setattr(routes_module, "get_user", fake_get_user)
    monkeypatch.setattr(routes_module, "get_flight", fake_get_flight)
    monkeypatch.setattr(routes_module, "change_flight_seats", fake_change_flight_seats)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    await engine.dispose()


@pytest.mark.asyncio
async def test_create_booking_success(client: AsyncClient):
    token = create_token(
        subject="1",
        email="user@example.com",
        role="passenger",
        secret_key="change-me",
        algorithm="HS256",
        expires_delta=__import__("datetime").timedelta(minutes=30),
    )
    response = await client.post(
        "/bookings",
        json={"flight_id": 10, "seats_booked": 2},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["user_id"] == 1
    assert body["flight_id"] == 10
    assert body["status"] == "pending"
    assert body["total_price"] == "500.00"
