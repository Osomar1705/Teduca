"""Schemas del módulo de reseñas."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    course_id: uuid.UUID
    rating: int
    comment: str | None = None
    created_at: datetime
    reviewer_name: str = ""
    reviewer_avatar: str | None = None


class ReviewSummary(BaseModel):
    avg_rating: float
    count: int
    distribution: dict[int, int]  # {1: n, 2: n, 3: n, 4: n, 5: n}
