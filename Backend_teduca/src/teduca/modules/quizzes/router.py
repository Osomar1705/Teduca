"""Endpoints de quizzes."""

import uuid

from fastapi import APIRouter, Depends, status

from teduca.core.dependencies import CurrentUser, DbSession, require_role
from teduca.modules.quizzes.schemas import (
    AttemptResult,
    AttemptSubmit,
    QuizCreate,
    QuizRead,
)
from teduca.modules.quizzes.service import QuizService

TeacherDep = Depends(require_role("teacher", "admin"))

course_quizzes_router = APIRouter(prefix="/courses/{course_id}/quizzes", tags=["quizzes"])
quizzes_router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@course_quizzes_router.post(
    "",
    response_model=QuizRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[TeacherDep],
)
async def create_quiz(
    course_id: uuid.UUID,
    data: QuizCreate,
    current_user: CurrentUser,
    session: DbSession,
) -> QuizRead:
    return await QuizService(session).create(course_id, data, current_user)


@quizzes_router.get("/{quiz_id}", response_model=QuizRead)
async def get_quiz(quiz_id: uuid.UUID, session: DbSession) -> QuizRead:
    return await QuizService(session).get_or_404(quiz_id)


@quizzes_router.post(
    "/{quiz_id}/attempts",
    response_model=AttemptResult,
    status_code=status.HTTP_201_CREATED,
)
async def submit_attempt(
    quiz_id: uuid.UUID,
    data: AttemptSubmit,
    current_user: CurrentUser,
    session: DbSession,
) -> AttemptResult:
    return await QuizService(session).submit_attempt(quiz_id, data, current_user)
