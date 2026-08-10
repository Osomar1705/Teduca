"""Modelos de identidad: User, Role (RBAC N:M) y RefreshToken."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from teduca.core.database import Base, TimestampMixin, UUIDMixin

# Tabla puente N:M usuario <-> rol
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)


class Role(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))

    users: Mapped[list["User"]] = relationship(secondary=user_roles, back_populates="roles")


class User(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Nullable: las cuentas creadas vía Google no tienen contraseña local.
    password_hash: Mapped[str | None] = mapped_column(String(255))
    # Proveedor de identidad: "local" (email+contraseña) o "google".
    auth_provider: Mapped[str] = mapped_column(String(20), default="local", nullable=False)
    # Identificador estable de Google (claim `sub`) para cuentas OAuth.
    google_sub: Mapped[str | None] = mapped_column(String(64), unique=True, index=True)
    avatar: Mapped[str | None] = mapped_column(String(512))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    roles: Mapped[list[Role]] = relationship(
        secondary=user_roles, back_populates="users", lazy="selectin"
    )

    @property
    def role_names(self) -> list[str]:
        return [r.name for r in self.roles]


class PasswordResetToken(UUIDMixin, TimestampMixin, Base):
    """Token de un solo uso para restablecer contraseña."""

    __tablename__ = "password_reset_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(256), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    @property
    def is_valid(self) -> bool:
        from datetime import UTC
        return not self.used and self.expires_at > datetime.now(UTC)


class EmailVerificationToken(UUIDMixin, TimestampMixin, Base):
    """Token de un solo uso para verificar la dirección de email."""

    __tablename__ = "email_verification_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    token_hash: Mapped[str] = mapped_column(String(256), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    @property
    def is_valid(self) -> bool:
        from datetime import UTC
        return not self.used and self.expires_at > datetime.now(UTC)


class RefreshToken(UUIDMixin, TimestampMixin, Base):
    """Refresh tokens persistidos para rotación y revocación real."""

    __tablename__ = "refresh_tokens"

    jti: Mapped[str] = mapped_column(String(36), unique=True, index=True, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    @property
    def is_active(self) -> bool:
        return self.revoked_at is None
