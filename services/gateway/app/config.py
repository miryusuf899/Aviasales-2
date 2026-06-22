from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    user_service_url: str = "http://localhost:8001"
    flight_service_url: str = "http://localhost:8002"
    booking_service_url: str = "http://localhost:8003"
    payment_service_url: str = "http://localhost:8004"
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    cors_origins: str = (
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "http://localhost:5173,"
        "http://127.0.0.1:5173"
    )

    @property
    def routes(self) -> dict[str, str]:
        return {
            "/api/users": self.user_service_url,
            "/api/flights": self.flight_service_url,
            "/api/bookings": self.booking_service_url,
            "/api/payments": self.payment_service_url,
        }


settings = Settings()
