"""Schemas Pydantic del módulo onboarding."""

import re
import uuid
from datetime import date
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

USERNAME_RE = re.compile(r'^[a-zA-Z0-9_]{4,30}$')

EDU_DOMAINS = {
    ".edu", ".edu.pe", ".edu.ar", ".edu.mx", ".edu.co", ".edu.br",
    ".edu.cl", ".edu.bo", ".edu.ec", ".edu.uy", ".ac.uk", ".edu.au",
}

VALID_GOALS = {
    "learn", "mentorship", "teach", "team", "research", "content",
}

VALID_LEARNING_STYLES = {
    "short_videos", "live_classes", "practice", "readings", "projects", "mentoring_1to1",
}


def _is_edu_email(email: str) -> bool:
    email = email.lower()
    return any(email.endswith(d) for d in EDU_DOMAINS)


# ── Paso 1 ────────────────────────────────────────────────────────────────────

class Step1Update(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    username: str = Field(min_length=4, max_length=30)
    birth_date: date

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not USERNAME_RE.match(v):
            raise ValueError(
                "Solo letras, números y '_'. Mínimo 4 caracteres, sin espacios."
            )
        return v.lower()


# ── Paso 2 ────────────────────────────────────────────────────────────────────

class Step2Update(BaseModel):
    institution: str = Field(min_length=2, max_length=120)
    career: str = Field(min_length=2, max_length=120)
    academic_year: str = Field(min_length=2, max_length=30)
    goals: list[str] = Field(min_length=1)

    @field_validator("goals")
    @classmethod
    def validate_goals(cls, v: list[str]) -> list[str]:
        invalid = set(v) - VALID_GOALS
        if invalid:
            raise ValueError(f"Objetivos inválidos: {invalid}")
        return v


# ── Paso 3 ────────────────────────────────────────────────────────────────────

class Step3Update(BaseModel):
    subject_tags: list[str] = Field(default_factory=list)
    project_interests: list[str] = Field(default_factory=list)
    learning_styles: list[str] = Field(min_length=1)

    @field_validator("subject_tags", "project_interests")
    @classmethod
    def clean_tags(cls, v: list[str]) -> list[str]:
        return [t.strip()[:40] for t in v if t.strip()][:20]

    @field_validator("learning_styles")
    @classmethod
    def validate_styles(cls, v: list[str]) -> list[str]:
        invalid = set(v) - VALID_LEARNING_STYLES
        if invalid:
            raise ValueError(f"Estilos inválidos: {invalid}")
        return v


# ── Lectura ───────────────────────────────────────────────────────────────────

class OnboardingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None = None
    username: str | None = None
    birth_date: date | None = None
    is_edu_verified: bool = False
    institution: str | None = None
    career: str | None = None
    academic_year: str | None = None
    goals: list[str] = []
    subject_tags: list[str] = []
    project_interests: list[str] = []
    learning_styles: list[str] = []
    current_step: int = 1
    completed: bool = False


class OnboardingStatus(BaseModel):
    """Respuesta ligera para decidir si mostrar el onboarding."""
    completed: bool
    current_step: int


class UsernameCheck(BaseModel):
    available: bool


class CheckUsernameRequest(BaseModel):
    username: Annotated[str, Field(min_length=4, max_length=30)]
