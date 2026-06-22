import httpx

from app.core.config import settings
from aviakit.errors import AppError


async def send_telegram(chat_id: str, message: str) -> None:
    if settings.telegram_bot_token == "your_bot_token":
        raise AppError("TELEGRAM_NOT_CONFIGURED", "Не задан TELEGRAM_BOT_TOKEN", 503)
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
            json={"chat_id": chat_id, "text": message},
        )
    if response.status_code >= 400:
        raise AppError("TELEGRAM_SEND_FAILED", "Telegram API вернул ошибку", 502)
