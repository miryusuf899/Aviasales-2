from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from typing import TypeVar

import httpx

from aviakit.errors import AppError


T = TypeVar("T")


async def retry_async(fn: Callable[[], Awaitable[T]], attempts: int = 2) -> T:
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            return await fn()
        except (httpx.ConnectError, httpx.ReadTimeout, httpx.ConnectTimeout) as exc:
            last_error = exc
            if attempt + 1 < attempts:
                await asyncio.sleep(0.15 * (attempt + 1))
    assert last_error is not None
    raise last_error


def raise_service_error(service_name: str, exc: Exception) -> None:
    if isinstance(exc, httpx.TimeoutException | httpx.NetworkError):
        raise AppError(
            "UPSTREAM_UNAVAILABLE",
            f"{service_name} временно недоступен",
            503,
        ) from exc
    raise AppError("UPSTREAM_ERROR", f"Ошибка вызова {service_name}: {exc}", 502) from exc
