from decimal import Decimal
from typing import Any

import httpx

from app.core.config import settings
from aviakit.errors import AppError
from aviakit.http import raise_service_error, retry_async


async def get_user(user_id: int) -> dict[str, Any]:
    async def request() -> httpx.Response:
        async with httpx.AsyncClient(timeout=5.0) as client:
            return await client.get(f"{settings.user_service_url}/users/{user_id}")

    try:
        response = await retry_async(request)
    except Exception as exc:  # noqa: BLE001
        raise_service_error("User Service", exc)

    if response.status_code == 404:
        raise AppError("USER_NOT_FOUND", "Пользователь с указанным ID не найден", 404)
    if response.status_code >= 400:
        raise AppError("USER_SERVICE_ERROR", "User Service вернул ошибку", 502)
    return response.json()


async def get_flight(flight_id: int) -> dict[str, Any]:
    async def request() -> httpx.Response:
        async with httpx.AsyncClient(timeout=5.0) as client:
            return await client.get(f"{settings.flight_service_url}/flights/{flight_id}")

    try:
        response = await retry_async(request)
    except Exception as exc:  # noqa: BLE001
        raise_service_error("Flight Service", exc)

    if response.status_code == 404:
        raise AppError("FLIGHT_NOT_FOUND", "Рейс с указанным ID не найден", 404)
    if response.status_code >= 400:
        raise AppError("FLIGHT_SERVICE_ERROR", "Flight Service вернул ошибку", 502)
    return response.json()


async def change_flight_seats(flight_id: int, delta: int) -> dict[str, Any]:
    async def request() -> httpx.Response:
        async with httpx.AsyncClient(timeout=5.0) as client:
            return await client.patch(
                f"{settings.flight_service_url}/flights/{flight_id}/seats",
                json={"delta": delta},
                headers={"X-Internal-Token": settings.internal_service_token},
            )

    try:
        response = await retry_async(request)
    except Exception as exc:  # noqa: BLE001
        raise_service_error("Flight Service", exc)

    if response.status_code == 409:
        raise AppError("NO_AVAILABLE_SEATS", "Недостаточно свободных мест на рейсе", 409)
    if response.status_code == 404:
        raise AppError("FLIGHT_NOT_FOUND", "Рейс с указанным ID не найден", 404)
    if response.status_code >= 400:
        raise AppError("FLIGHT_SERVICE_ERROR", "Flight Service вернул ошибку", 502)
    return response.json()


def total_price(price: str | int | float | Decimal, seats: int) -> Decimal:
    return Decimal(str(price)) * Decimal(seats)
