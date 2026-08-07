"""Schemas Pydantic para el módulo announcements."""

import uuid
from datetime import datetime

from pydantic import BaseModel

from teduca.modules.announcements.models import AnnouncementType


class AnnouncementRead(BaseModel):
    id: uuid.UUID
    title: str
    body: str | None
    image: str | None
    type: AnnouncementType
    pinned: bool
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AnnouncementCreate(BaseModel):
    title: str
    body: str | None = None
    image: str | None = None
    type: AnnouncementType = AnnouncementType.info
    pinned: bool = False
    active: bool = True
