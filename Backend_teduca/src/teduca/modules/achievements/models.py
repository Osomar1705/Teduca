"""Modelos de logros: catálogo Achievement y desbloqueos UserAchievement."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from teduca.core.database import Base, TimestampMixin, UUIDMixin


class Achievement(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "achievements"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    # métrica evaluada y umbral (ver achievements/rules.py)
    metric: Mapped[str] = mapped_column(String(50), nullable=False)
    threshold: Mapped[int] = mapped_column(Integer, nullable=False)


class UserAchievement(UUIDMixin, Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    achievement_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False, index=True
    )
    unlocked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
