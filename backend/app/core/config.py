from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "Retail Sentinel"
    api_v1_prefix: str = "/api/v1"
    secret_key: str = "change-me-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/retail_sentinel"
    encryption_key: str = "replace-with-base64-fernet-key"

    media_webrtc_base_url: str = "http://localhost:1984"

    bootstrap_admin_email: str = "admin@retailsentinel.local"
    bootstrap_admin_password: str = "Admin@123"
    bootstrap_admin_full_name: str = "Platform Admin"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()
