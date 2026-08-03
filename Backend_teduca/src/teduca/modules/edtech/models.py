"""Modelos del dominio marketplace (EdTech).

Un `TeacherProfile` es la ficha pública de un docente. Sobre él se apoyan los
cursos ofertados, los favoritos, los swipes/matches, las reservas y el chat.
Los datos de nombre/avatar viven en `users`; aquí solo el perfil profesional.
"""

import uuid

from sqlalchemy import (
    JSON,
    Boolean,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from teduca.core.database import Base, TimestampMixin, UUIDMixin
from teduca.modules.users.models import User


class TeacherProfile(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "teacher_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    specialty: Mapped[str] = mapped_column(String(160), default="", nullable=False)
    bio: Mapped[str] = mapped_column(Text, default="", nullable=False)
    experience_years: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    university: Mapped[str] = mapped_column(String(160), default="", nullable=False)
    modality: Mapped[str] = mapped_column(String(20), default="virtual", nullable=False)
    hourly_price: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    location: Mapped[str] = mapped_column(String(160), default="", nullable=False)
    languages: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    availability: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    categories: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    socials: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    # Solo los perfiles publicados aparecen en descubrir/listados.
    is_published: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False, index=True)
    # Agregados de solo lectura (se recalcularían con reseñas reales).
    rating: Mapped[float] = mapped_column(Numeric(3, 2), default=0, nullable=False)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    students_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped[User] = relationship(lazy="joined")
    courses: Mapped[list["MarketplaceCourse"]] = relationship(
        back_populates="teacher", cascade="all, delete-orphan"
    )

    # Datos de identidad expuestos desde `users` para la ficha pública.
    @property
    def name(self) -> str:
        return self.user.name

    @property
    def avatar(self) -> str | None:
        return self.user.avatar

    @property
    def email(self) -> str:
        return self.user.email


class MarketplaceCourse(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "marketplace_courses"

    teacher_profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teacher_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    image: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    category: Mapped[str] = mapped_column(String(60), default="general", nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    level: Mapped[str] = mapped_column(String(20), default="beginner", nullable=False)
    duration_hours: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    rating: Mapped[float] = mapped_column(Numeric(3, 2), default=0, nullable=False)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    teacher: Mapped[TeacherProfile] = relationship(back_populates="courses", lazy="joined")

    @property
    def teacher_name(self) -> str:
        return self.teacher.name


class Favorite(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "favorites"
    __table_args__ = (UniqueConstraint("user_id", "teacher_profile_id", name="uq_favorite"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    teacher_profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teacher_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )


class Swipe(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "swipes"
    __table_args__ = (UniqueConstraint("user_id", "teacher_profile_id", name="uq_swipe"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    teacher_profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teacher_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    direction: Mapped[str] = mapped_column(String(8), nullable=False)  # left | right
    matched: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class Reservation(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "reservations"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    teacher_profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teacher_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    marketplace_course_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("marketplace_courses.id", ondelete="SET NULL")
    )
    date: Mapped[str] = mapped_column(String(20), nullable=False)  # ISO date
    time: Mapped[str] = mapped_column(String(10), nullable=False)  # "18:00"
    modality: Mapped[str] = mapped_column(String(20), default="virtual", nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(8), default="USD", nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False, index=True)

    teacher: Mapped[TeacherProfile] = relationship(lazy="joined")
    course: Mapped["MarketplaceCourse | None"] = relationship(lazy="joined")

    @property
    def teacher_name(self) -> str:
        return self.teacher.name

    @property
    def teacher_avatar(self) -> str | None:
        return self.teacher.avatar

    @property
    def course_title(self) -> str | None:
        return self.course.title if self.course else None


class ChatThread(UUIDMixin, TimestampMixin, Base):
    """Hilo de conversación entre un alumno y un perfil docente (tras un match)."""

    __tablename__ = "chat_threads"
    __table_args__ = (
        UniqueConstraint("student_id", "teacher_profile_id", name="uq_chat_thread"),
    )

    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    teacher_profile_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teacher_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )

    teacher: Mapped[TeacherProfile] = relationship(lazy="joined")
    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="thread", cascade="all, delete-orphan", order_by="ChatMessage.created_at"
    )

    @property
    def teacher_name(self) -> str:
        return self.teacher.name

    @property
    def teacher_avatar(self) -> str | None:
        return self.teacher.avatar


class ChatMessage(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "chat_messages"

    thread_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chat_threads.id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)

    thread: Mapped[ChatThread] = relationship(back_populates="messages")
