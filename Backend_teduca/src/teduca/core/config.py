"""Configuración central de la aplicación (Pydantic Settings)."""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    environment: Literal["development", "staging", "production", "test"] = "development"
    debug: bool = True
    project_name: str = "TEDUCA"
    api_v1_prefix: str = "/api/v1"

    # Database
    database_url: str = "postgresql+asyncpg://teduca:teduca@localhost:5432/teduca"

    # Redis (opcional). Vacío = deshabilitado (serverless sin Redis).
    redis_url: str = ""

    # Security / JWT
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    jwt_algorithm: str = "HS256"

    # Google OAuth (OPCIONAL). El login con Google es configurable y NO obligatorio.
    # - enable_google_auth: interruptor maestro (ENABLE_GOOGLE_AUTH=true/false).
    # - google_client_id / google_client_secret: credenciales OAuth.
    # El botón de Google solo se ofrece si el interruptor está activo Y hay client_id.
    enable_google_auth: bool = False
    google_client_id: str = ""
    google_client_secret: str = ""

    # CORS (lista separada por comas en el .env)
    cors_origins: str = "http://localhost:3000"

    # Rate limiting
    rate_limit_default: str = "100/minute"

    @property
    def google_enabled(self) -> bool:
        """Google solo se ofrece si está activado Y hay client_id configurado."""
        return self.enable_google_auth and bool(self.google_client_id.strip())

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
