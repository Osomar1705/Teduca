"""Modelo Lesson (1:N con Course)."""

import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from teduca.core.database import Base, TimestampMixin, UUIDMixin
from teduca.modules.courses.models import Course


class Lesson(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "lessons"

    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    content: Mapped[str | None] = mapped_column(Text)
    video_url: Mapped[str | None] = mapped_column(String(512))
    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # minutos

    course: Mapped[Course] = relationship(back_populates="lessons")
