"""Modelo FileAsset: referencia a un archivo en Supabase Storage."""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from teduca.core.database import Base, TimestampMixin, UUIDMixin


class FileAsset(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "file_assets"

    # ── Propietario y contexto ──────────────────────────────────────────────
    uploader_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    course_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("courses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("lessons.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ── Información del archivo ─────────────────────────────────────────────
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    display_name: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    # Tipo lógico: pdf, video, image, audio, document, spreadsheet,
    # presentation, archive, certificate, other
    file_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Versión (para futuro versionado de archivos)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # ── Supabase Storage ───────────────────────────────────────────────────
    bucket: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)

    # ── Categoría y acceso ─────────────────────────────────────────────────
    # Categoría: material, video, recording, assignment, resource, certificate,
    # thumbnail, avatar, attachment, exam, guide, project, event, community
    category: Mapped[str] = mapped_column(String(30), nullable=False, index=True)

    # Nivel de acceso: public, enrolled, mentors, admins, link
    access_level: Mapped[str] = mapped_column(
        String(20), default="enrolled", nullable=False, index=True
    )

    # Estado: active, archived, deleted
    status: Mapped[str] = mapped_column(
        String(20), default="active", nullable=False, index=True
    )

    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Metadatos extensibles: duración de video, páginas, resolución, etc.
    extra_metadata: Mapped[dict | None] = mapped_column(JSONB, default=dict)

    __table_args__ = (
        Index("ix_file_assets_bucket_path", "bucket", "storage_path", unique=True),
    )
