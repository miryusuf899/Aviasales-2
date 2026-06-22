from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    smtp_host: str = "sandbox.smtp.mailtrap.io"
    smtp_port: int = 2525
    smtp_user: str = "your_user"
    smtp_password: str = "your_password"
    smtp_from: str = "noreply@example.com"
    telegram_bot_token: str = "your_bot_token"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_notifications_topic: str = "notifications"
    kafka_enabled: bool = False


settings = Settings()
