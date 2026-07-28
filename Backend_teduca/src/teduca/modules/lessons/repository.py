"""Repositorio de lecciones."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.lessons.models import Lesson


class LessonRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, lesson_id: uuid.UUID) -> Lesson | None:
        return await self.session.get(Lesson, lesson_id)

    async def list_by_course(self, course_id: uuid.UUID) -> list[Lesson]:
        result = await self.session.execute(
            select(Lesson)
            .where(Lesson.course_id == course_id)
            .order_by(Lesson.order, Lesson.created_at)
        )
        return list(result.scalars())

    async def add(self, lesson: Lesson) -> Lesson:
        self.session.add(lesson)
        await self.session.flush()
        return lesson

    async def delete(self, lesson: Lesson) -> None:
        await self.session.delete(lesson)
        await self.session.flush()
