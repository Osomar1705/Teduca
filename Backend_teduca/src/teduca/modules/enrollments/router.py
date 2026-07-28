"""Endpoints de inscripciones."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.core.pagination import Page, PaginationParams, pagination_params
from teduca.modules.enrollments.schemas import EnrollmentRead, ProgressUpdate
from teduca.modules.enrollments.service import EnrollmentService

# Inscribirse cuelga del curso
course_enroll_router = APIRouter(prefix="/courses/{course_id}", tags=["enrollments"])
# Consultar/actualizar las propias inscripciones
enrollments_router = APIRouter(prefix="/enrollments", tags=["enrollments"])


@course_enroll_router.post(
    "/enroll", response_model=EnrollmentRead, status_code=status.HTTP_201_CREATED
)
async def enroll(
    course_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> EnrollmentRead:
    return await EnrollmentService(session).enroll(course_id, current_user)


@enrollments_router.get("/me", response_model=Page[EnrollmentRead])
async def my_enrollments(
    current_user: CurrentUser,
    session: DbSession,
    params: Annotated[PaginationParams, Depends(pagination_params)],
) -> Page[EnrollmentRead]:
    items, total = await EnrollmentService(session).list_mine(
        current_user, offset=params.offset, limit=params.limit
    )
    return Page.create([EnrollmentRead.model_validate(e) for e in items], total, params)


@enrollments_router.patch("/{enrollment_id}/progress", response_model=EnrollmentRead)
async def update_progress(
    enrollment_id: uuid.UUID,
    data: ProgressUpdate,
    current_user: CurrentUser,
    session: DbSession,
) -> EnrollmentRead:
    return await EnrollmentService(session).update_progress(
        enrollment_id, data.progress, current_user
    )
