"""Modelo de materiales de curso (Google Drive y enlaces externos)."""

import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from teduca.core.database import Base, TimestampMixin, UUIDMixin
from teduca.modules.edtech.models import MarketplaceCourse, TeacherProfile

MATERIAL_TYPES = {"video", "pdf", "document", "presentation", "link", "other"}


class CourseMaterial(UUIDMixin, TimestampMixin, Base):
    """Recurso académico publicado por un docente para un curso.

    La URL apunta a Google Drive u otro servicio externo;
    TEDUCA nunca almacena el archivo, solo el enlace.
    """

    __tablename__ = "course_materials"

    teacher_profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teacher_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    marketplace_course_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("marketplace_courses.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    material_type: Mapped[str] = mapped_column(String(20), default="link", nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    teacher: Mapped[TeacherProfile] = relationship(lazy="joined")
    course: Mapped[MarketplaceCourse | None] = relationship(lazy="joined")
