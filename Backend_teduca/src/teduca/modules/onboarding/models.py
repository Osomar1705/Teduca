"""Modelo de onboarding de usuario."""

import uuid

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from teduca.core.database import Base, TimestampMixin, UUIDMixin


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
    # Múltiples objetivos: ["learn", "mentorship", "teach", "team", "research", "content"]
    goals: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list, nullable=False)

    # ── Paso 3: Intereses ─────────────────────────────────────────────────
    subject_tags: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list, nullable=False)
    project_interests: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list, nullable=False)
    learning_styles: Mapped[list[str]] = mapped_column(ARRAY(Text), default=list, nullable=False)

    # ── Estado ────────────────────────────────────────────────────────────
    current_step: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["teduca.modules.users.models.User"] = relationship(  # type: ignore[name-defined]
        "User", foreign_keys=[user_id]
    )
