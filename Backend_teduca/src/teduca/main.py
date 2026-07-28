"""Punto de entrada de la aplicación: app factory de FastAPI."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from teduca.api.v1.router import api_router
from teduca.core.config import settings
from teduca.core.database import AsyncSessionLocal
from teduca.core.exceptions import register_exception_handlers
from teduca.core.redis import close_redis
from teduca.core.seed import seed
from teduca.modules.analytics.handlers import register_analytics_handlers
from teduca.modules.gamification.handlers import register_gamification_handlers

register_analytics_handlers()
register_gamification_handlers()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Siembra idempotente de roles, logros y recompensas al arrancar.
    async with AsyncSessionLocal() as session:
        await seed(session)
    yield
    await close_redis()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        lifespan=lifespan,
    )

    # Rate limiting global (Redis-backed en producción vía storage_uri)
    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=[settings.rate_limit_default],
        storage_uri=settings.redis_url,
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    @app.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "environment": settings.environment}

    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
