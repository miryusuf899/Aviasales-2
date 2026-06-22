from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://user:pass@localhost:5432/payments_db"
    booking_service_url: str = "http://localhost:8003"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_notifications_topic: str = "notifications"
    kafka_enabled: bool = False


settings = Settings()
