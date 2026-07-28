"""Schemas del módulo assignments."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AssignmentBase(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str | None = None
    instructions: str | None = None
    due_date: datetime | None = None
    max_score: int = Field(default=100, ge=1, le=1000)


class AssignmentCreate(AssignmentBase):
    pass


class AssignmentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = None
    instructions: str | None = None
    due_date: datetime | None = None
    max_score: int | None = Field(default=None, ge=1, le=1000)


class AssignmentRead(AssignmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
