"""Schemas del módulo lessons."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LessonBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str | None = None
    content: str | None = None
    video_url: str | None = None
    order: int = 0
    duration: int = Field(default=0, ge=0)


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = None
    content: str | None = None
    video_url: str | None = None
    order: int | None = None
    duration: int | None = Field(default=None, ge=0)


class LessonRead(LessonBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
