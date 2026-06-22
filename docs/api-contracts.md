# API Contracts

## Error Format

```json
{
  "error": {
    "code": "FLIGHT_NOT_FOUND",
    "message": "Рейс с указанным ID не найден",
    "status": 404
  }
}
```

## User

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "Aziz",
  "last_name": "Davlatov",
  "phone": "+992900000000",
  "role": "passenger"
}
```

## Flight

```json
{
  "id": 10,
  "flight_number": "TJ101",
  "from_airport": "DYU",
  "to_airport": "IST",
  "departure_time": "2026-07-01T08:00:00Z",
  "arrival_time": "2026-07-01T11:30:00Z",
  "available_seats": 20,
  "price": "250.00",
  "currency": "USD"
}
```

## Booking

```json
{
  "id": 55,
  "user_id": 1,
  "flight_id": 10,
  "status": "pending",
  "seats_booked": 1,
  "total_price": "250.00",
  "created_at": "2026-06-18T10:00:00Z"
}
```

Allowed booking statuses: `pending`, `confirmed`, `payment_failed`, `cancelled`.

## Payment

```json
{
  "id": 30,
  "booking_id": 55,
  "amount": "250.00",
  "status": "success",
  "payment_method": "card",
  "transaction_id": "txn_abc123",
  "created_at": "2026-06-18T10:05:00Z"
}
```

Allowed payment statuses: `pending`, `success`, `failed`.

## Notification Event

```json
{
  "event_type": "booking_confirmed",
  "user_email": "user@example.com",
  "telegram_chat_id": "123456789",
  "message": "Ваша бронь #55 подтверждена",
  "created_at": "2026-06-18T10:06:00Z"
}
```

Allowed event types: `booking_created`, `payment_success`, `payment_failed`, `booking_cancelled`.

## JWT Payload

```json
{
  "sub": "1",
  "email": "user@example.com",
  "role": "passenger",
  "exp": 1751000000
}
```
