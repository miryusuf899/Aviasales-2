from time import perf_counter

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from app.config import settings
from aviakit.errors import AppError, error_response, install_error_handlers
from aviakit.security import bearer_token, decode_token

app = FastAPI(title="API Gateway", version="1.0.0")
install_error_handlers(app)

origins = ["*"] if settings.cors_origins == "*" else settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def is_public_request(request: Request) -> bool:
    path = request.url.path
    if path in {"/health", "/docs", "/openapi.json", "/redoc"}:
        return True
    if path in {"/api/users/register", "/api/users/login", "/api/users/refresh"}:
        return True
    if request.method == "GET" and path.startswith("/api/flights"):
        return True
    return False


@app.middleware("http")
async def auth_and_logging(request: Request, call_next):
    start = perf_counter()
    request.state.user_headers = {}
    if request.url.path.startswith("/api/") and not is_public_request(request):
        try:
            payload = decode_token(
                bearer_token(request.headers.get("authorization")),
                secret_key=settings.jwt_secret_key,
                algorithm=settings.jwt_algorithm,
            )
            request.state.user_headers = {
                "x-user-id": str(payload["sub"]),
                "x-user-email": payload.get("email", ""),
                "x-user-role": payload.get("role", "passenger"),
            }
        except AppError as exc:
            return error_response(exc.code, exc.message, exc.status_code)

    response = await call_next(request)
    response.headers["x-response-time-ms"] = f"{(perf_counter() - start) * 1000:.2f}"
    return response


def match_route(path: str) -> tuple[str, str] | None:
    for prefix, target in settings.routes.items():
        if path == prefix or path.startswith(f"{prefix}/"):
            upstream_path = path.removeprefix(prefix) or "/"
            return target.rstrip("/"), upstream_path
    return None


async def proxy(request: Request) -> Response:
    match = match_route(request.url.path)
    if not match:
        return error_response("ROUTE_NOT_FOUND", "Маршрут не найден", 404)

    target, upstream_path = match
    query = request.url.query
    upstream_url = f"{target}{upstream_path}"
    if query:
        upstream_url = f"{upstream_url}?{query}"

    excluded = {"host", "content-length"}
    headers = {k: v for k, v in request.headers.items() if k.lower() not in excluded}
    headers.update(request.state.user_headers)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            upstream_response = await client.request(
                request.method,
                upstream_url,
                content=await request.body(),
                headers=headers,
            )
    except httpx.HTTPError:
        return error_response("UPSTREAM_UNAVAILABLE", "Целевой сервис временно недоступен", 503)

    response_headers = {
        k: v
        for k, v in upstream_response.headers.items()
        if k.lower() not in {"content-encoding", "transfer-encoding", "connection"}
    }
    return Response(
        content=upstream_response.content,
        status_code=upstream_response.status_code,
        headers=response_headers,
        media_type=upstream_response.headers.get("content-type"),
    )


@app.api_route(
    "/api/users/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    tags=["proxy"],
)
async def proxy_users(request: Request) -> Response:
    return await proxy(request)


@app.api_route(
    "/api/flights/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    tags=["proxy"],
)
async def proxy_flights(request: Request) -> Response:
    return await proxy(request)


@app.api_route(
    "/api/bookings/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    tags=["proxy"],
)
async def proxy_bookings(request: Request) -> Response:
    return await proxy(request)


@app.api_route(
    "/api/payments/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    tags=["proxy"],
)
async def proxy_payments(request: Request) -> Response:
    return await proxy(request)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/routes")
async def routes() -> dict[str, str]:
    return settings.routes
