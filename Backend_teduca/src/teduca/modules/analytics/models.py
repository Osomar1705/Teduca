"""Modelos de analítica: Event (event store append-only) y UserActivity."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from teduca.core.database import Base, UUIDMixin


class Event(UUIDMixin, Base):
    """Event store: registro inmutable de todos los eventos de dominio.

    Fuente desacoplada para pipelines de analytics y machine learning.
    """

    __tablename__ = "events"

    name: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(index=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )


class UserActivity(UUIDMixin, Base):
    """Bitácora de acciones del usuario (features para ML)."""

    __tablename__ = "user_activity"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    action: Mapped[str] = mapped_column(String(60), nullable=False)
    meta: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
