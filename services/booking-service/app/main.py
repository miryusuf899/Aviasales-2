from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router
from app.db.session import engine
from app.models.booking import Booking  # noqa: F401
from aviakit.db import Base
from aviakit.errors import install_error_handlers


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Booking Service", version="1.0.0", lifespan=lifespan)
install_error_handlers(app)
app.include_router(router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
