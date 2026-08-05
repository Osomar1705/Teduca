"""Schemas Pydantic v2 para el módulo community."""

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    category: str = Field(default="todo")
    title: str | None = None
    location: str | None = None
    deadline: date | None = None
    link: str | None = None
    tags: list[str] = Field(default_factory=list)
    image_urls: list[str] = Field(default_factory=list)


class PostAuthor(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    avatar: str | None


class PostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    author_id: uuid.UUID
    content: str
    category: str
    title: str | None
    location: str | None
    deadline: date | None
    link: str | None
    tags: list
    image_urls: list
    likes_count: int
    comments_count: int
    saves_count: int
    created_at: datetime
    updated_at: datetime
    author: PostAuthor
    liked_by_me: bool = False
    saved_by_me: bool = False


class PostFeed(BaseModel):
    items: list[PostRead]
    total: int
    page: int
    page_size: int
