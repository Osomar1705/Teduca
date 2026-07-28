"""Schemas del módulo achievements."""

import uuid

from pydantic import BaseModel, ConfigDict


class AchievementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    name: str
    description: str
    metric: str
    threshold: int
