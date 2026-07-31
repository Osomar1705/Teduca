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

    # CORS (lista separada por comas en el .env)
    cors_origins: str = "http://localhost:3000"

    # Rate limiting
    rate_limit_default: str = "100/minute"

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
