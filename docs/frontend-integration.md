# Frontend Integration

Frontend must call only the API Gateway.

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Public Requests

- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/refresh`
- `GET /api/content/marketing`
- `GET /api/flights/airports`
- `GET /api/flights/flights`
- `GET /api/flights/flights/{id}`

## Protected Requests

Send the access token from `POST /api/users/login`:

```http
Authorization: Bearer <access_token>
```

Protected routes:

- `GET /api/users/users/me`
- `PUT /api/users/{id}`
- `POST /api/bookings/bookings`
- `GET /api/bookings/bookings`
- `GET /api/bookings/bookings/{id}`
- `DELETE /api/bookings/bookings/{id}`
- `POST /api/payments/payments`
- `GET /api/payments/payments`
- `GET /api/payments/payments/{id}`

Admin-only routes:

- `POST /api/flights/airports`
- `POST /api/flights/flights`
- `PUT /api/flights/flights/{id}`
- `DELETE /api/flights/flights/{id}`
- `PATCH /api/flights/flights/{id}/seats`

## Example Fetch Client

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw data?.error ?? {
      code: "REQUEST_FAILED",
      message: "Request failed",
      status: response.status,
    };
  }

  return data as T;
}
```

## Login Example

```ts
const tokens = await apiFetch<{
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}>("/users/login", {
  method: "POST",
  body: JSON.stringify({
    email: "user@example.com",
    password: "secret123",
  }),
});
```

## Create Booking Example

```ts
const booking = await apiFetch("/bookings/bookings", {
  method: "POST",
  token: tokens.access_token,
  body: JSON.stringify({
    flight_id: 10,
    seats_booked: 1,
  }),
});
```

## CORS

Allowed frontend origins by default:

- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:5173`
- `http://127.0.0.1:5173`

If the frontend runs on another port, add it to `CORS_ORIGINS` in `docker-compose.yml`.
