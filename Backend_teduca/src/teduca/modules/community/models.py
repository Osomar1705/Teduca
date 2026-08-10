"""Modelos de la comunidad: Post, PostLike, PostSave."""

import uuid
from datetime import date

from sqlalchemy import JSON, Date, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from teduca.core.database import Base, TimestampMixin, UUIDMixin

# JSONB en Postgres (producción) y JSON en el resto (SQLite en tests).
JSONType = JSON().with_variant(JSONB, "postgresql")


class Post(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "community_posts"

    author_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(30), default="todo", nullable=False, index=True)
    title: Mapped[str | None] = mapped_column(String(255))
    location: Mapped[str | None] = mapped_column(String(255))
    deadline: Mapped[date | None] = mapped_column(Date)
    link: Mapped[str | None] = mapped_column(String(512))
    tags: Mapped[list] = mapped_column(JSONType, default=list, nullable=False)
    image_urls: Mapped[list] = mapped_column(JSONType, default=list, nullable=False)
    likes_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    comments_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    saves_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    author: Mapped["User"] = relationship("User", lazy="selectin")


class PostLike(Base):
    __tablename__ = "community_post_likes"

    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("community_posts.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )


class PostSave(Base):
    __tablename__ = "community_post_saves"

    post_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("community_posts.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
