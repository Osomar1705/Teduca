"""Repositorio de tareas."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.assignments.models import Assignment


class AssignmentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, assignment_id: uuid.UUID) -> Assignment | None:
        return await self.session.get(Assignment, assignment_id)

    async def list_by_course(self, course_id: uuid.UUID) -> list[Assignment]:
        result = await self.session.execute(
            select(Assignment)
            .where(Assignment.course_id == course_id)
            .order_by(Assignment.due_date.is_(None), Assignment.due_date)
        )
        return list(result.scalars())

    async def add(self, assignment: Assignment) -> Assignment:
        self.session.add(assignment)
        await self.session.flush()
        return assignment

    async def delete(self, assignment: Assignment) -> None:
        await self.session.delete(assignment)
        await self.session.flush()
