import httpx

from app.core.config import settings
from aviakit.errors import AppError
from aviakit.http import raise_service_error, retry_async


async def update_booking_status(booking_id: int, status: str) -> None:
    async def request() -> httpx.Response:
        async with httpx.AsyncClient(timeout=5.0) as client:
            return await client.patch(
                f"{settings.booking_service_url}/bookings/{booking_id}/status",
                json={"status": status},
            )

    try:
        response = await retry_async(request)
    except Exception as exc:  # noqa: BLE001
        raise_service_error("Booking Service", exc)

    if response.status_code >= 400:
        raise AppError("BOOKING_SERVICE_ERROR", "Booking Service не обновил статус брони", 502)
