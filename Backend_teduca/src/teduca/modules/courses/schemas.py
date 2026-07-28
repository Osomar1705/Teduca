"""Schemas del módulo courses."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

CourseStatus = Literal["draft", "published", "archived"]
CourseLevel = Literal["beginner", "intermediate", "advanced"]


class CourseBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str | None = None
    image: str | None = None
    category: str = Field(default="general", max_length=50)
    level: CourseLevel = "beginner"


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = None
    image: str | None = None
    category: str | None = Field(default=None, max_length=50)
    level: CourseLevel | None = None
    status: CourseStatus | None = None


class CourseRead(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    teacher_id: uuid.UUID
    slug: str
    status: CourseStatus
    created_at: datetime
    updated_at: datetime
