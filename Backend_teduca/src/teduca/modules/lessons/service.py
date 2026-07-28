"""Lógica de negocio de lecciones. La propiedad se hereda del curso."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import NotFoundError
from teduca.modules.courses.service import CourseService
from teduca.modules.lessons.models import Lesson
from teduca.modules.lessons.repository import LessonRepository
from teduca.modules.lessons.schemas import LessonCreate, LessonUpdate
from teduca.modules.users.models import User


class LessonService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = LessonRepository(session)
        self.courses = CourseService(session)

    async def list_by_course(self, course_id: uuid.UUID) -> list[Lesson]:
        await self.courses.get_or_404(course_id)
        return await self.repo.list_by_course(course_id)

    async def _get_owned(self, lesson_id: uuid.UUID, user: User) -> Lesson:
        lesson = await self.repo.get_by_id(lesson_id)
        if lesson is None:
            raise NotFoundError("Lección no encontrada.")
        course = await self.courses.get_or_404(lesson.course_id)
        self.courses._assert_owner(course, user)
        return lesson

    async def create(self, course_id: uuid.UUID, data: LessonCreate, user: User) -> Lesson:
        course = await self.courses.get_or_404(course_id)
        self.courses._assert_owner(course, user)
        lesson = Lesson(course_id=course_id, **data.model_dump())
        return await self.repo.add(lesson)

    async def update(self, lesson_id: uuid.UUID, data: LessonUpdate, user: User) -> Lesson:
        lesson = await self._get_owned(lesson_id, user)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(lesson, field, value)
        await self.session.flush()
        await self.session.refresh(lesson)
        return lesson

    async def delete(self, lesson_id: uuid.UUID, user: User) -> None:
        lesson = await self._get_owned(lesson_id, user)
        await self.repo.delete(lesson)
