from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import func, select

from app.api.routes import router
from app.db.session import SessionLocal
from app.db.session import engine
from app.models.flight import Airport, Flight  # noqa: F401
from app.services.seed import sample_data
from aviakit.db import Base
from aviakit.errors import install_error_handlers


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as session:
        flight_count = await session.scalar(select(func.count(Flight.id)))
        if not flight_count:
            airports, flights = sample_data()
            session.add_all([*airports, *flights])
            await session.commit()
    yield


app = FastAPI(title="Flight Service", version="1.0.0", lifespan=lifespan)
install_error_handlers(app)
app.include_router(router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
