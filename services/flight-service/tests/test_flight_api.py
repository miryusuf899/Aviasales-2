import os
import sys
from datetime import UTC, datetime

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
for module in list(sys.modules):
    if module == "app" or module.startswith("app."):
        del sys.modules[module]
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db import session as db_session
from app.main import app
from aviakit.db import Base
from aviakit.security import create_token


def admin_headers() -> dict[str, str]:
    token = create_token(
        subject="1",
        email="admin@example.com",
        role="admin",
        secret_key="change-me",
        algorithm="HS256",
        expires_delta=__import__("datetime").timedelta(minutes=30),
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
async def client():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    db_session.engine = engine
    db_session.SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    await engine.dispose()


@pytest.mark.asyncio
async def test_flight_seats_cannot_go_negative(client: AsyncClient):
    dyu = (
        await client.post(
            "/airports",
            json={"code": "DYU", "city": "Dushanbe", "country": "TJ"},
            headers=admin_headers(),
        )
    ).json()
    ist = (
        await client.post(
            "/airports",
            json={"code": "IST", "city": "Istanbul", "country": "TR"},
            headers=admin_headers(),
        )
    ).json()
    flight = (
        await client.post(
            "/flights",
            json={
                "flight_number": "TJ101",
                "from_airport_id": dyu["id"],
                "to_airport_id": ist["id"],
                "departure_time": datetime(2026, 7, 1, 8, 0, tzinfo=UTC).isoformat(),
                "arrival_time": datetime(2026, 7, 1, 11, 30, tzinfo=UTC).isoformat(),
                "available_seats": 1,
                "price": "250.00",
                "currency": "USD",
            },
            headers=admin_headers(),
        )
    ).json()

    ok = await client.patch(
        f"/flights/{flight['id']}/seats",
        json={"delta": -1},
        headers={"X-Internal-Token": "change-me-internal"},
    )
    assert ok.status_code == 200
    assert ok.json()["available_seats"] == 0

    fail = await client.patch(
        f"/flights/{flight['id']}/seats",
        json={"delta": -1},
        headers={"X-Internal-Token": "change-me-internal"},
    )
    assert fail.status_code == 409
    assert fail.json()["error"]["code"] == "NO_AVAILABLE_SEATS"
