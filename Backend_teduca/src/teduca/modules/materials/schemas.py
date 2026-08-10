"""Schemas del módulo de materiales."""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, HttpUrl, field_validator

from teduca.modules.materials.models import MATERIAL_TYPES


class CourseMaterialCreate(BaseModel):
    marketplace_course_id: uuid.UUID | None = None
    title: str
    description: str | None = None
    material_type: str = "link"
    url: str
    sort_order: int = 0

    @field_validator("material_type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        if v not in MATERIAL_TYPES:
            raise ValueError(f"Tipo inválido. Debe ser uno de: {', '.join(sorted(MATERIAL_TYPES))}")
        return v

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            raise ValueError("La URL debe comenzar con http:// o https://")
        if len(v) > 2048:
            raise ValueError("La URL es demasiado larga (máx 2048 caracteres)")
        return v


class CourseMaterialUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    material_type: str | None = None
    url: str | None = None
    sort_order: int | None = None

    @field_validator("material_type")
    @classmethod
    def validate_type(cls, v: str | None) -> str | None:
        if v is not None and v not in MATERIAL_TYPES:
            raise ValueError(f"Tipo inválido. Debe ser uno de: {', '.join(sorted(MATERIAL_TYPES))}")
        return v

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v.startswith(("http://", "https://")):
            raise ValueError("La URL debe comenzar con http:// o https://")
        return v


class CourseMaterialRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    teacher_profile_id: uuid.UUID
    marketplace_course_id: uuid.UUID | None
    title: str
    description: str | None
    material_type: str
    url: str
    sort_order: int
    created_at: datetime
