"""Endpoints de reseñas de cursos."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.core.pagination import Page, PaginationParams, pagination_params
from teduca.modules.reviews.schemas import ReviewCreate, ReviewRead, ReviewSummary
from teduca.modules.reviews.service import ReviewService

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post(
    "/courses/{course_id}",
    response_model=ReviewRead,
    status_code=status.HTTP_200_OK,
)
async def upsert_review(
    course_id: uuid.UUID,
    data: ReviewCreate,
    current_user: CurrentUser,
    session: DbSession,
) -> ReviewRead:
    review = await ReviewService(session).upsert_review(current_user.id, course_id, data)
    return ReviewRead.model_validate(review)


@router.get("/courses/{course_id}", response_model=Page[ReviewRead])
async def list_reviews(
    course_id: uuid.UUID,
    session: DbSession,
    params: Annotated[PaginationParams, Depends(pagination_params)],
) -> Page[ReviewRead]:
    items, total = await ReviewService(session).list_reviews(
        course_id, offset=params.offset, limit=params.limit
    )
    return Page.create([ReviewRead.model_validate(r) for r in items], total, params)


@router.get("/courses/{course_id}/summary", response_model=ReviewSummary)
async def get_summary(
    course_id: uuid.UUID,
    session: DbSession,
) -> ReviewSummary:
    return await ReviewService(session).get_summary(course_id)


@router.get("/me", response_model=list[ReviewRead])
async def my_reviews(current_user: CurrentUser, session: DbSession) -> list[ReviewRead]:
    items = await ReviewService(session).my_reviews(current_user.id)
    return [ReviewRead.model_validate(r) for r in items]
