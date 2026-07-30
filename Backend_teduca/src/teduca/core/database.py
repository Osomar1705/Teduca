"""Configuración de SQLAlchemy 2.0 async: engine, session factory y Base declarativa."""

import uuid
from collections.abc import AsyncGenerator
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from sqlalchemy.pool import NullPool

from teduca.core.config import settings


def _build_engine():
    """Crea el engine adaptándose al entorno.

    En serverless (Vercel) cada invocación es un proceso efímero detrás de un
    pooler (pgBouncer de Neon/Supabase): usamos NullPool, desactivamos la caché
    de prepared statements (incompatible con pgBouncer en modo transacción) y
    forzamos SSL cuando el host no es local.
    """
    url = settings.database_url
    is_local = "localhost" in url or "127.0.0.1" in url or "@postgres" in url

    if settings.is_production or not is_local:
        connect_args: dict = {"statement_cache_size": 0}
        if not is_local:
            connect_args["ssl"] = True
        return create_async_engine(
            url,
            echo=False,
            poolclass=NullPool,
            connect_args=connect_args,
        )

    # Desarrollo local (Docker): pool normal.
    return create_async_engine(
        url,
        echo=settings.debug and not settings.is_production,
        pool_pre_ping=True,
        pool_size=20,
        max_overflow=10,
    )


engine = _build_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


class Base(AsyncAttrs, DeclarativeBase):
    """Base declarativa para todos los modelos."""


class TimestampMixin:
    """Columnas de auditoría compartidas por todas las entidades."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class UUIDMixin:
    """PK UUID por defecto para todas las entidades de dominio."""

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)


async def get_db() -> AsyncGenerator[AsyncSession]:
    """Dependencia FastAPI: sesión con commit/rollback automáticos."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
