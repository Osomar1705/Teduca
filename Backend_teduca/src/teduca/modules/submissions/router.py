"""Endpoints de entregas."""

import uuid

from fastapi import APIRouter, status

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.modules.submissions.schemas import (
    GradeRequest,
    SubmissionCreate,
    SubmissionRead,
)
from teduca.modules.submissions.service import SubmissionService

assignment_submissions_router = APIRouter(
    prefix="/assignments/{assignment_id}", tags=["submissions"]
)
submissions_router = APIRouter(prefix="/submissions", tags=["submissions"])


@assignment_submissions_router.post(
    "/submit", response_model=SubmissionRead, status_code=status.HTTP_201_CREATED
)
async def submit(
    assignment_id: uuid.UUID,
    data: SubmissionCreate,
    current_user: CurrentUser,
    session: DbSession,
) -> SubmissionRead:
    return await SubmissionService(session).submit(assignment_id, data, current_user)


@assignment_submissions_router.get("/submissions", response_model=list[SubmissionRead])
async def list_submissions(
    assignment_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> list[SubmissionRead]:
    return await SubmissionService(session).list_for_assignment(assignment_id, current_user)


@submissions_router.get("/{submission_id}", response_model=SubmissionRead)
async def get_submission(
    submission_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> SubmissionRead:
    return await SubmissionService(session).get_owned(submission_id, current_user)


@submissions_router.post("/{submission_id}/grade", response_model=SubmissionRead)
async def grade_submission(
    submission_id: uuid.UUID,
    data: GradeRequest,
    current_user: CurrentUser,
    session: DbSession,
) -> SubmissionRead:
    return await SubmissionService(session).grade(submission_id, data, current_user)
