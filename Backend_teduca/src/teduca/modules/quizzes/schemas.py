"""Schemas del módulo quizzes."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

QuestionKind = Literal["single"]


# --- Creación (profesor) ---
class AnswerOptionCreate(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    is_correct: bool = False


class QuestionCreate(BaseModel):
    text: str = Field(min_length=1)
    kind: QuestionKind = "single"
    order: int = 0
    points: int = Field(default=1, ge=1)
    options: list[AnswerOptionCreate] = Field(min_length=2)


class QuizCreate(BaseModel):
    lesson_id: uuid.UUID | None = None
    title: str = Field(min_length=3, max_length=200)
    description: str | None = None
    pass_score: int = Field(default=60, ge=0, le=100)
    questions: list[QuestionCreate] = Field(min_length=1)


# --- Lectura (sin revelar cuál es la correcta al estudiante) ---
class AnswerOptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    text: str


class QuestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    text: str
    kind: QuestionKind
    order: int
    points: int
    options: list[AnswerOptionRead]


class QuizRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    course_id: uuid.UUID
    lesson_id: uuid.UUID | None
    title: str
    description: str | None
    pass_score: int
    questions: list[QuestionRead]


# --- Intento (estudiante) ---
class AnswerSubmit(BaseModel):
    question_id: uuid.UUID
    selected_option_id: uuid.UUID


class AttemptSubmit(BaseModel):
    answers: list[AnswerSubmit] = Field(min_length=1)


class AttemptResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quiz_id: uuid.UUID
    student_id: uuid.UUID
    score: int
    passed: bool
    completed_at: datetime
