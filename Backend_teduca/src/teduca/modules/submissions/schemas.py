"""Schemas del módulo submissions."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

SubmissionStatus = Literal["submitted", "graded", "late"]


class SubmissionCreate(BaseModel):
    content: str | None = None
    file_url: str | None = None


class GradeRequest(BaseModel):
    score: int = Field(ge=0)
    feedback: str | None = None


class SubmissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    assignment_id: uuid.UUID
    student_id: uuid.UUID
    content: str | None = None
    file_url: str | None = None
    status: SubmissionStatus
    score: int | None = None
    feedback: str | None = None
    submitted_at: datetime | None = None
    graded_at: datetime | None = None
