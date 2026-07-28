"""Schemas del módulo machine_learning."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class RecommendationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    kind: str
    payload: dict[str, Any]
    score: float
    rank: int
    model_name: str
    model_version: str
    created_at: datetime
