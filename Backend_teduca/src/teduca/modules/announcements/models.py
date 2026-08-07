"""Modelo Announcement — comunicados oficiales TEDUCA."""

import enum

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from teduca.core.database import Base, UUIDMixin
from sqlalchemy import DateTime, func
from datetime import datetime


class AnnouncementType(str, enum.Enum):
    info = "info"
    event = "event"
    alert = "alert"


class Announcement(UUIDMixin, Base):
    __tablename__ = "announcements"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    type: Mapped[AnnouncementType] = mapped_column(
        Enum(AnnouncementType, name="announcement_type"), default=AnnouncementType.info, nullable=False
    )
    pinned: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
