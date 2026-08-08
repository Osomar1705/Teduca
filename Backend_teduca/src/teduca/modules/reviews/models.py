"""Modelo CourseReview: reseñas de usuarios sobre cursos del marketplace."""

import uuid

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from teduca.core.database import Base, TimestampMixin, UUIDMixin


class CourseReview(UUIDMixin, TimestampMixin, Base):
    """Un usuario puede dejar una sola reseña por curso."""

    __tablename__ = "course_reviews"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_course_review"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("marketplace_courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    comment: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship(lazy="joined")  # type: ignore[name-defined]  # noqa: F821

    @property
    def reviewer_name(self) -> str:
        return self.user.name

    @property
    def reviewer_avatar(self) -> str | None:
        return self.user.avatar
