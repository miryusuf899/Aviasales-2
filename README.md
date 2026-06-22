# Airline Booking System

Учебная микросервисная система бронирования авиабилетов на FastAPI по ТЗ.

## Сервисы

- `gateway` — единая точка входа, JWT-проверка и reverse proxy.
- `user-service` — регистрация, логин, JWT, профили пользователей.
- `flight-service` — аэропорты, рейсы, поиск и управление местами.
- `booking-service` — создание, просмотр и отмена бронирований.
- `payment-service` — мок-оплата, идемпотентность, callback в Booking Service.
- `notification-service` — email/Telegram уведомления и Kafka consumer.

## Запуск

```bash
docker compose up --build
```

Swagger:

- Gateway: http://localhost:8000/docs
- User Service: http://localhost:8001/docs
- Flight Service: http://localhost:8002/docs
- Booking Service: http://localhost:8003/docs
- Payment Service: http://localhost:8004/docs
- Notification Service: http://localhost:8005/docs

Для локального запуска отдельного сервиса задайте `PYTHONPATH`:

```bash
PYTHONPATH=services/common:services/user-service uvicorn app.main:app --reload --port 8001
```

## Проверка

```bash
python -m compileall services
pytest
```

API-контракты зафиксированы в [docs/api-contracts.md](docs/api-contracts.md).

## Frontend

Фронтенд должен обращаться только к Gateway:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Подробности и примеры запросов: [docs/frontend-integration.md](docs/frontend-integration.md).
# Aviasales-2
