"""Modelos de gamificación: PointsLedger (append-only), Streak, Reward, UserReward."""

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from teduca.core.database import Base, TimestampMixin, UUIDMixin


class PointsLedger(UUIDMixin, TimestampMixin, Base):
    """Libro mayor de puntos, append-only y auditable."""

    __tablename__ = "points_ledger"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(80), nullable=False)
    event_name: Mapped[str | None] = mapped_column(String(60))


class Streak(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "streaks"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_active_date: Mapped[date | None] = mapped_column(Date)


class Reward(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "rewards"

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    cost_points: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class UserReward(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "user_rewards"
    __table_args__ = (UniqueConstraint("user_id", "reward_id", name="uq_user_reward"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reward_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rewards.id", ondelete="CASCADE"), nullable=False, index=True
    )
    redeemed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
