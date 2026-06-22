from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://user:pass@localhost:5432/bookings_db"
    user_service_url: str = "http://localhost:8001"
    flight_service_url: str = "http://localhost:8002"
    payment_service_url: str = "http://localhost:8004"
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    internal_service_token: str = "change-me-internal"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_notifications_topic: str = "notifications"
    kafka_enabled: bool = False


settings = Settings()
