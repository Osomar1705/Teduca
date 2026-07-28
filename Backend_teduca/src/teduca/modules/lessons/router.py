"""Endpoints de lecciones.

Las lecciones cuelgan de un curso: se listan/crean bajo /courses/{id}/lessons
y se editan/borran por su id en /lessons/{id}.
"""

import uuid

from fastapi import APIRouter, Depends, status

from teduca.core.dependencies import CurrentUser, DbSession, require_role
from teduca.modules.lessons.schemas import LessonCreate, LessonRead, LessonUpdate
from teduca.modules.lessons.service import LessonService

TeacherDep = Depends(require_role("teacher", "admin"))

# Router anidado bajo courses
course_lessons_router = APIRouter(prefix="/courses/{course_id}/lessons", tags=["lessons"])
# Router plano para editar/borrar por id
lessons_router = APIRouter(prefix="/lessons", tags=["lessons"])


@course_lessons_router.get("", response_model=list[LessonRead])
async def list_lessons(course_id: uuid.UUID, session: DbSession) -> list[LessonRead]:
    return await LessonService(session).list_by_course(course_id)


@course_lessons_router.post(
    "",
    response_model=LessonRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[TeacherDep],
)
async def create_lesson(
    course_id: uuid.UUID,
    data: LessonCreate,
    current_user: CurrentUser,
    session: DbSession,
) -> LessonRead:
    return await LessonService(session).create(course_id, data, current_user)


@lessons_router.patch("/{lesson_id}", response_model=LessonRead, dependencies=[TeacherDep])
async def update_lesson(
    lesson_id: uuid.UUID,
    data: LessonUpdate,
    current_user: CurrentUser,
    session: DbSession,
) -> LessonRead:
    return await LessonService(session).update(lesson_id, data, current_user)


@lessons_router.delete(
    "/{lesson_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[TeacherDep],
)
async def delete_lesson(
    lesson_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> None:
    await LessonService(session).delete(lesson_id, current_user)
