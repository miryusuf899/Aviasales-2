from __future__ import annotations

import json
from datetime import UTC, datetime

from app.core.config import settings


async def publish_notification_event(
    event_type: str,
    user_email: str,
    message: str,
    telegram_chat_id: str | None = None,
) -> None:
    if not settings.kafka_enabled:
        return
    from aiokafka import AIOKafkaProducer

    producer = AIOKafkaProducer(bootstrap_servers=settings.kafka_bootstrap_servers)
    await producer.start()
    try:
        payload = {
            "event_type": event_type,
            "user_email": user_email,
            "telegram_chat_id": telegram_chat_id,
            "message": message,
            "created_at": datetime.now(UTC).isoformat(),
        }
        await producer.send_and_wait(
            settings.kafka_notifications_topic,
            json.dumps(payload).encode("utf-8"),
        )
    finally:
        await producer.stop()
