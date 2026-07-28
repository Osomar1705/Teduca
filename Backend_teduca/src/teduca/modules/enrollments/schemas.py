"""Schemas del módulo enrollments."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

EnrollmentStatus = Literal["active", "completed", "dropped"]


class EnrollmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    course_id: uuid.UUID
    progress: int
    status: EnrollmentStatus
    completed_at: datetime | None = None
    created_at: datetime


class ProgressUpdate(BaseModel):
    progress: int = Field(ge=0, le=100)
