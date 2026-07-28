"""Repositorio de inscripciones."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.enrollments.models import Enrollment


class EnrollmentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, student_id: uuid.UUID, course_id: uuid.UUID) -> Enrollment | None:
        result = await self.session.execute(
            select(Enrollment).where(
                Enrollment.student_id == student_id,
                Enrollment.course_id == course_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, enrollment_id: uuid.UUID) -> Enrollment | None:
        return await self.session.get(Enrollment, enrollment_id)

    async def list_for_student(
        self, student_id: uuid.UUID, *, offset: int, limit: int
    ) -> tuple[list[Enrollment], int]:
        base = select(Enrollment).where(Enrollment.student_id == student_id)
        total = await self.session.scalar(select(func.count()).select_from(base.subquery()))
        result = await self.session.execute(
            base.order_by(Enrollment.created_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars()), total or 0

    async def add(self, enrollment: Enrollment) -> Enrollment:
        self.session.add(enrollment)
        await self.session.flush()
        return enrollment
