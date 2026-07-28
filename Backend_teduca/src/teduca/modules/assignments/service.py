"""Lógica de negocio de tareas. La propiedad se hereda del curso."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import NotFoundError
from teduca.modules.assignments.models import Assignment
from teduca.modules.assignments.repository import AssignmentRepository
from teduca.modules.assignments.schemas import AssignmentCreate, AssignmentUpdate
from teduca.modules.courses.service import CourseService
from teduca.modules.users.models import User


class AssignmentService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = AssignmentRepository(session)
        self.courses = CourseService(session)

    async def get_or_404(self, assignment_id: uuid.UUID) -> Assignment:
        assignment = await self.repo.get_by_id(assignment_id)
        if assignment is None:
            raise NotFoundError("Tarea no encontrada.")
        return assignment

    async def list_by_course(self, course_id: uuid.UUID) -> list[Assignment]:
        await self.courses.get_or_404(course_id)
        return await self.repo.list_by_course(course_id)

    async def create(self, course_id: uuid.UUID, data: AssignmentCreate, user: User) -> Assignment:
        course = await self.courses.get_or_404(course_id)
        self.courses._assert_owner(course, user)
        assignment = Assignment(course_id=course_id, **data.model_dump())
        return await self.repo.add(assignment)

    async def update(
        self, assignment_id: uuid.UUID, data: AssignmentUpdate, user: User
    ) -> Assignment:
        assignment = await self.get_or_404(assignment_id)
        course = await self.courses.get_or_404(assignment.course_id)
        self.courses._assert_owner(course, user)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(assignment, field, value)
        await self.session.flush()
        await self.session.refresh(assignment)
        return assignment

    async def delete(self, assignment_id: uuid.UUID, user: User) -> None:
        assignment = await self.get_or_404(assignment_id)
        course = await self.courses.get_or_404(assignment.course_id)
        self.courses._assert_owner(course, user)
        await self.repo.delete(assignment)
