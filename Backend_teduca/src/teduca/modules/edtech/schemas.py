"""Schemas del dominio marketplace (EdTech)."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Modality = Literal["virtual", "in-person", "both"]
CourseLevel = Literal["beginner", "intermediate", "advanced"]
SwipeDirection = Literal["left", "right"]
ReservationStatus = Literal["pending", "confirmed", "completed", "cancelled"]


# --- Cursos del marketplace ---------------------------------------------
class MarketplaceCourseBase(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    image: str = ""
    category: str = Field(default="general", max_length=60)
    description: str = ""
    level: CourseLevel = "beginner"
    duration_hours: int = Field(default=0, ge=0)
    price: float = Field(default=0, ge=0)
    currency: str = "USD"


class MarketplaceCourseCreate(MarketplaceCourseBase):
    pass


class MarketplaceCourseRead(MarketplaceCourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    teacher_profile_id: uuid.UUID
    teacher_name: str = ""
    rating: float = 0
    reviews_count: int = 0


# --- Perfil docente ------------------------------------------------------
class TeacherProfileWrite(BaseModel):
    """Campos editables por el docente (rating/alumnos son de solo lectura)."""

    specialty: str = Field(default="", max_length=160)
    bio: str = ""
    experience_years: int = Field(default=0, ge=0)
    university: str = Field(default="", max_length=160)
    modality: Modality = "virtual"
    hourly_price: float = Field(default=0, ge=0)
    currency: str = "USD"
    location: str = Field(default="", max_length=160)
    languages: list[str] = Field(default_factory=list)
    availability: list[dict] = Field(default_factory=list)
    categories: list[str] = Field(default_factory=list)
    socials: list[dict] = Field(default_factory=list)
    is_published: bool = True


class MyProfileUpdate(TeacherProfileWrite):
    """Actualización del perfil propio, opcionalmente con sus cursos ofertados."""

    courses: list[MarketplaceCourseCreate] | None = None


class TeacherProfileRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    avatar: str | None = None
    specialty: str
    bio: str
    experience_years: int
    university: str
    modality: Modality
    hourly_price: float
    currency: str
    location: str
    languages: list[str]
    availability: list[dict]
    categories: list[str]
    socials: list[dict]
    is_published: bool
    rating: float
    reviews_count: int
    students_count: int
    courses: list[MarketplaceCourseRead] = []


# --- Swipe / match -------------------------------------------------------
class SwipeRequest(BaseModel):
    direction: SwipeDirection


class SwipeResult(BaseModel):
    matched: bool
    teacher: TeacherProfileRead


# --- Reservas ------------------------------------------------------------
class ReservationCreate(BaseModel):
    teacher_profile_id: uuid.UUID
    marketplace_course_id: uuid.UUID | None = None
    date: str
    time: str
    modality: Modality = "virtual"
    price: float = Field(default=0, ge=0)
    currency: str = "USD"


class ReservationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    teacher_profile_id: uuid.UUID
    teacher_name: str
    teacher_avatar: str | None = None
    marketplace_course_id: uuid.UUID | None = None
    course_title: str | None = None
    date: str
    time: str
    modality: Modality
    price: float
    currency: str
    status: ReservationStatus
    created_at: datetime


# --- Chat ----------------------------------------------------------------
class ChatMessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=4000)


class ChatMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    thread_id: uuid.UUID
    sender_id: uuid.UUID
    body: str
    created_at: datetime


class ChatThreadRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    teacher_profile_id: uuid.UUID
    teacher_name: str
    teacher_avatar: str | None = None
    updated_at: datetime


# --- Stats del profesor --------------------------------------------------
class MonthStat(BaseModel):
    month: str  # "2026-02"
    count: int


class TeacherStats(BaseModel):
    students_count: int
    reservations_total: int
    reservations_by_month: list[MonthStat]
    rating: float
    reviews_count: int
