"""Endpoints de cursos."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from teduca.core.dependencies import CurrentUser, DbSession, require_role
from teduca.core.pagination import Page, PaginationParams, pagination_params
from teduca.modules.courses.schemas import (
    CourseCreate,
    CourseRead,
    CourseStatus,
    CourseUpdate,
)
from teduca.modules.courses.service import CourseService

router = APIRouter(prefix="/courses", tags=["courses"])

TeacherDep = Depends(require_role("teacher", "admin"))


@router.get("", response_model=Page[CourseRead])
async def list_courses(
    session: DbSession,
    params: Annotated[PaginationParams, Depends(pagination_params)],
    status_filter: Annotated[CourseStatus | None, Query(alias="status")] = None,
    category: str | None = None,
) -> Page[CourseRead]:
    items, total = await CourseService(session).list(
        offset=params.offset,
        limit=params.limit,
        status=status_filter,
        category=category,
    )
    return Page.create([CourseRead.model_validate(c) for c in items], total, params)


@router.post(
    "",
    response_model=CourseRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[TeacherDep],
)
async def create_course(
    data: CourseCreate, current_user: CurrentUser, session: DbSession
) -> CourseRead:
    return await CourseService(session).create(data, current_user)


@router.get("/{course_id}", response_model=CourseRead)
async def get_course(course_id: uuid.UUID, session: DbSession) -> CourseRead:
    return await CourseService(session).get_or_404(course_id)


@router.patch("/{course_id}", response_model=CourseRead, dependencies=[TeacherDep])
async def update_course(
    course_id: uuid.UUID,
    data: CourseUpdate,
    current_user: CurrentUser,
    session: DbSession,
) -> CourseRead:
    return await CourseService(session).update(course_id, data, current_user)


@router.delete(
    "/{course_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[TeacherDep],
)
async def delete_course(
    course_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> None:
    await CourseService(session).soft_delete(course_id, current_user)
