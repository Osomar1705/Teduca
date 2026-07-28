"""Schemas del módulo analytics."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class UserActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    action: str
    meta: dict[str, Any]
    created_at: datetime


class AnalyticsOverview(BaseModel):
    events_by_name: dict[str, int]
    total_events: int
