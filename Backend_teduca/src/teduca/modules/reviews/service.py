"""Servicio de reseñas de cursos."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import NotFoundError
from teduca.modules.edtech.models import MarketplaceCourse
from teduca.modules.reviews.models import CourseReview
from teduca.modules.reviews.schemas import ReviewCreate, ReviewSummary


class ReviewService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def _get_course_or_404(self, course_id: uuid.UUID) -> MarketplaceCourse:
        course = await self.session.get(MarketplaceCourse, course_id)
        if course is None:
            raise NotFoundError("Curso no encontrado.")
        return course

    async def upsert_review(
        self, user_id: uuid.UUID, course_id: uuid.UUID, data: ReviewCreate
    ) -> CourseReview:
        await self._get_course_or_404(course_id)

        result = await self.session.execute(
            select(CourseReview).where(
                CourseReview.user_id == user_id,
                CourseReview.course_id == course_id,
            )
        )
        review = result.scalar_one_or_none()

        if review is None:
            review = CourseReview(
                user_id=user_id,
                course_id=course_id,
                rating=data.rating,
                comment=data.comment,
            )
            self.session.add(review)
        else:
            review.rating = data.rating
            review.comment = data.comment

        await self.session.flush()
        await self.session.refresh(review)
        return review

    async def list_reviews(
        self, course_id: uuid.UUID, *, offset: int = 0, limit: int = 20
    ) -> tuple[list[CourseReview], int]:
        await self._get_course_or_404(course_id)
        base = select(CourseReview).where(CourseReview.course_id == course_id)
        total = await self.session.scalar(select(func.count()).select_from(base.subquery()))
        result = await self.session.execute(
            base.order_by(CourseReview.created_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars()), int(total or 0)

    async def get_summary(self, course_id: uuid.UUID) -> ReviewSummary:
        await self._get_course_or_404(course_id)
        result = await self.session.execute(
            select(CourseReview.rating).where(CourseReview.course_id == course_id)
        )
        ratings = [r for (r,) in result.fetchall()]

        count = len(ratings)
        avg = round(sum(ratings) / count, 2) if count > 0 else 0.0
        distribution = {i: 0 for i in range(1, 6)}
        for r in ratings:
            distribution[r] = distribution.get(r, 0) + 1

        return ReviewSummary(avg_rating=avg, count=count, distribution=distribution)

    async def my_reviews(self, user_id: uuid.UUID) -> list[CourseReview]:
        result = await self.session.execute(
            select(CourseReview)
            .where(CourseReview.user_id == user_id)
            .order_by(CourseReview.created_at.desc())
        )
        return list(result.scalars())
