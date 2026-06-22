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

from app.db import session as db_session
from app.main import app
from aviakit.db import Base


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
async def test_register_login_and_duplicate_email(client: AsyncClient):
    payload = {
        "email": "user@example.com",
        "password": "secret123",
        "first_name": "Aziz",
        "last_name": "Davlatov",
        "phone": "+992900000000",
    }
    response = await client.post("/register", json=payload)
    assert response.status_code == 201
    assert response.json()["email"] == payload["email"]
    assert "hashed_password" not in response.json()

    duplicate = await client.post("/register", json=payload)
    assert duplicate.status_code == 409
    assert duplicate.json()["error"]["code"] == "EMAIL_ALREADY_REGISTERED"

    login = await client.post(
        "/login",
        json={"email": payload["email"], "password": payload["password"]},
    )
    assert login.status_code == 200
    assert login.json()["access_token"]
