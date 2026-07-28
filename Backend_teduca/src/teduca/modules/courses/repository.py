"""Repositorio de cursos."""

import uuid

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.courses.models import Course


class CourseRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _base_query(self) -> Select:
        return select(Course).where(Course.deleted_at.is_(None))

    async def get_by_id(self, course_id: uuid.UUID) -> Course | None:
        course = await self.session.get(Course, course_id)
        if course is None or course.deleted_at is not None:
            return None
        return course

    async def list(
        self,
        *,
        offset: int,
        limit: int,
        status: str | None = None,
        category: str | None = None,
        teacher_id: uuid.UUID | None = None,
    ) -> tuple[list[Course], int]:
        query = self._base_query()
        if status:
            query = query.where(Course.status == status)
        if category:
            query = query.where(Course.category == category)
        if teacher_id:
            query = query.where(Course.teacher_id == teacher_id)

        total = await self.session.scalar(select(func.count()).select_from(query.subquery()))
        result = await self.session.execute(
            query.order_by(Course.created_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars()), total or 0

    async def add(self, course: Course) -> Course:
        self.session.add(course)
        await self.session.flush()
        return course
