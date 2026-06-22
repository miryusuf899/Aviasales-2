from __future__ import annotations

import asyncio
import json

from pydantic import ValidationError

from app.core.config import settings
from app.schemas.notification import NotificationEvent
from app.services.email import send_email
from app.services.telegram import send_telegram


async def consume_notifications(stop_event: asyncio.Event) -> None:
    if not settings.kafka_enabled:
        return
    from aiokafka import AIOKafkaConsumer

    consumer = AIOKafkaConsumer(
        settings.kafka_notifications_topic,
        bootstrap_servers=settings.kafka_bootstrap_servers,
        group_id="notification-service",
        enable_auto_commit=False,
    )
    await consumer.start()
    try:
        while not stop_event.is_set():
            result = await consumer.getmany(timeout_ms=1000, max_records=10)
            for _, messages in result.items():
                for message in messages:
                    try:
                        event = NotificationEvent.model_validate(json.loads(message.value))
                        await send_email(event.user_email, "Airline Booking", event.message)
                        if event.telegram_chat_id:
                            await send_telegram(event.telegram_chat_id, event.message)
                        await consumer.commit()
                    except ValidationError:
                        await consumer.commit()
    finally:
        await consumer.stop()
