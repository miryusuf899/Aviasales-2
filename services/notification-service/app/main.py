import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router
from app.services.consumer import consume_notifications
from aviakit.errors import install_error_handlers


@asynccontextmanager
async def lifespan(_: FastAPI):
    stop_event = asyncio.Event()
    task = asyncio.create_task(consume_notifications(stop_event))
    yield
    stop_event.set()
    await task


app = FastAPI(title="Notification Service", version="1.0.0", lifespan=lifespan)
install_error_handlers(app)
app.include_router(router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
