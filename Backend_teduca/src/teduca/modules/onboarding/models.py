"""Modelo de onboarding de usuario."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from teduca.modules.users.models import User

from sqlalchemy import JSON, Boolean, Date, ForeignKey, Integer, String, Text, TypeDecorator
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from teduca.core.database import Base, TimestampMixin, UUIDMixin


class _TextList(TypeDecorator):
    """ARRAY(Text) en PostgreSQL, JSON en otros dialectos (ej. SQLite para tests)."""

    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(ARRAY(Text()))
        return dialect.type_descriptor(JSON())

    def process_bind_param(self, value, dialect):
        if dialect.name == "postgresql":
            return value
        return value  # JSON serializa listas directamente

    def process_result_value(self, value, dialect):
        if value is None:
            return []
        return value


class UserOnboarding(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "user_onboarding"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # ── Paso 1: Datos básicos ──────────────────────────────────────────────
    full_name: Mapped[str | None] = mapped_column(String(120))
    username: Mapped[str | None] = mapped_column(String(30), unique=True, index=True)
    birth_date: Mapped[Date | None] = mapped_column(Date)
    is_edu_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # ── Paso 2: Perfil académico ──────────────────────────────────────────
    institution: Mapped[str | None] = mapped_column(String(120))
    career: Mapped[str | None] = mapped_column(String(120))
    academic_year: Mapped[str | None] = mapped_column(String(30))  # "1er ciclo" … "Profesional"
    goals: Mapped[list[str]] = mapped_column(_TextList, default=list, nullable=False)

    # ── Paso 3: Intereses ─────────────────────────────────────────────────
    subject_tags: Mapped[list[str]] = mapped_column(_TextList, default=list, nullable=False)
    project_interests: Mapped[list[str]] = mapped_column(_TextList, default=list, nullable=False)
    learning_styles: Mapped[list[str]] = mapped_column(_TextList, default=list, nullable=False)

    # ── Estado ────────────────────────────────────────────────────────────
    current_step: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped[User] = relationship(
        "User", foreign_keys=[user_id]
    )
