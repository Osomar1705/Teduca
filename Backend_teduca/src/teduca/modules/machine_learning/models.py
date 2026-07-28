"""Modelo MLRecommendation: salidas de modelos, cacheadas para lectura del front."""

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from teduca.core.database import Base, UUIDMixin


class MLRecommendation(UUIDMixin, Base):
    __tablename__ = "ml_recommendations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # content | dropout | performance | cluster | fraud | reward
    kind: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    score: Mapped[float] = mapped_column(default=0.0)
    model_name: Mapped[str] = mapped_column(String(60), default="stub")
    model_version: Mapped[str] = mapped_column(String(20), default="0.0.1")
    rank: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
