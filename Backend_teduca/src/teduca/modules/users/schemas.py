"""Schemas Pydantic v2 del módulo users."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Any


class RoleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None = None


class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=120)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    avatar: str | None = None


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    avatar: str | None = None
    is_active: bool
    email_verified: bool
    roles: list[RoleRead] = []
    created_at: datetime
    updated_at: datetime


# ── TeacherProfile ─────────────────────────────────────────────────────────
# Usa el modelo TeacherProfile de edtech (tabla teacher_profiles existente).
# Los campos disponibles son los del modelo edtech; el frontend mapea a estos.


class TeacherProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    bio: str = ""
    experience_years: int = 0
    university: str = ""
    specialty: str = ""
    location: str = ""
    hourly_price: float = 0
    currency: str = "USD"
    modality: str = "virtual"
    languages: list[Any] = []
    categories: list[Any] = []
    socials: list[Any] = []
    is_published: bool = True
    rating: float = 0
    reviews_count: int = 0
    students_count: int = 0
    created_at: datetime
    updated_at: datetime


class PublicProfileRead(BaseModel):
    """Perfil público de un usuario (accesible sin autenticación)."""
    username: str
    full_name: str
    avatar: str | None = None
    institution: str | None = None
    career: str | None = None
    academic_year: str | None = None
    subject_tags: list[str] = []
    goals: list[str] = []


class TeacherProfileUpdate(BaseModel):
    bio: str | None = None
    experience_years: int | None = None
    university: str | None = Field(default=None, max_length=160)
    specialty: str | None = Field(default=None, max_length=160)
    location: str | None = Field(default=None, max_length=160)
    hourly_price: float | None = None
    currency: str | None = Field(default=None, max_length=8)
    modality: str | None = Field(default=None, max_length=20)
    languages: list[Any] | None = None
    categories: list[Any] | None = None
    socials: list[Any] | None = None
    is_published: bool | None = None
