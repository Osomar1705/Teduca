"""Modelo Course (dominio educativo)."""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from teduca.core.database import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from teduca.modules.lessons.models import Lesson


class Course(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "courses"

    teacher_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    image: Mapped[str | None] = mapped_column(String(512))
    category: Mapped[str] = mapped_column(String(50), default="general", nullable=False)
    level: Mapped[str] = mapped_column(String(20), default="beginner", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="draft", nullable=False, index=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
        order_by="Lesson.order",
    )
