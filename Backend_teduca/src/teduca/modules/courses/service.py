"""Lógica de negocio de cursos, con control de propiedad (ownership)."""

import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import ForbiddenError, NotFoundError
from teduca.core.text import unique_slug
from teduca.modules.courses.models import Course
from teduca.modules.courses.repository import CourseRepository
from teduca.modules.courses.schemas import CourseCreate, CourseUpdate
from teduca.modules.users.models import User


class CourseService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = CourseRepository(session)

    async def get_or_404(self, course_id: uuid.UUID) -> Course:
        course = await self.repo.get_by_id(course_id)
        if course is None:
            raise NotFoundError("Curso no encontrado.")
        return course

    @staticmethod
    def _assert_owner(course: Course, user: User) -> None:
        if course.teacher_id != user.id and "admin" not in user.role_names:
            raise ForbiddenError("No eres el propietario de este curso.")

    async def list(self, **kwargs) -> tuple[list[Course], int]:
        return await self.repo.list(**kwargs)

    async def create(self, data: CourseCreate, teacher: User) -> Course:
        course = Course(
            teacher_id=teacher.id,
            slug=unique_slug(data.title),
            **data.model_dump(),
        )
        return await self.repo.add(course)

    async def update(self, course_id: uuid.UUID, data: CourseUpdate, user: User) -> Course:
        course = await self.get_or_404(course_id)
        self._assert_owner(course, user)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(course, field, value)
        await self.session.flush()
        await self.session.refresh(course)
        return course

    async def soft_delete(self, course_id: uuid.UUID, user: User) -> None:
        course = await self.get_or_404(course_id)
        self._assert_owner(course, user)
        course.deleted_at = datetime.now(UTC)
        await self.session.flush()
