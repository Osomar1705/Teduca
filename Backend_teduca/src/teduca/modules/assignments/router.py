"""Endpoints de tareas."""

import uuid

from fastapi import APIRouter, Depends, status

from teduca.core.dependencies import CurrentUser, DbSession, require_role
from teduca.modules.assignments.schemas import (
    AssignmentCreate,
    AssignmentRead,
    AssignmentUpdate,
)
from teduca.modules.assignments.service import AssignmentService

TeacherDep = Depends(require_role("teacher", "admin"))

course_assignments_router = APIRouter(
    prefix="/courses/{course_id}/assignments", tags=["assignments"]
)
assignments_router = APIRouter(prefix="/assignments", tags=["assignments"])


@course_assignments_router.get("", response_model=list[AssignmentRead])
async def list_assignments(course_id: uuid.UUID, session: DbSession) -> list[AssignmentRead]:
    return await AssignmentService(session).list_by_course(course_id)


@course_assignments_router.post(
    "",
    response_model=AssignmentRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[TeacherDep],
)
async def create_assignment(
    course_id: uuid.UUID,
    data: AssignmentCreate,
    current_user: CurrentUser,
    session: DbSession,
) -> AssignmentRead:
    return await AssignmentService(session).create(course_id, data, current_user)


@assignments_router.get("/{assignment_id}", response_model=AssignmentRead)
async def get_assignment(assignment_id: uuid.UUID, session: DbSession) -> AssignmentRead:
    return await AssignmentService(session).get_or_404(assignment_id)


@assignments_router.patch(
    "/{assignment_id}", response_model=AssignmentRead, dependencies=[TeacherDep]
)
async def update_assignment(
    assignment_id: uuid.UUID,
    data: AssignmentUpdate,
    current_user: CurrentUser,
    session: DbSession,
) -> AssignmentRead:
    return await AssignmentService(session).update(assignment_id, data, current_user)


@assignments_router.delete(
    "/{assignment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[TeacherDep],
)
async def delete_assignment(
    assignment_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> None:
    await AssignmentService(session).delete(assignment_id, current_user)
