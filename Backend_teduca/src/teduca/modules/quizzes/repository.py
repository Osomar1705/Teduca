"""Repositorio de quizzes."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from teduca.modules.quizzes.models import Question, Quiz, QuizAttempt


class QuizRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_with_questions(self, quiz_id: uuid.UUID) -> Quiz | None:
        result = await self.session.execute(
            select(Quiz)
            .where(Quiz.id == quiz_id)
            .options(selectinload(Quiz.questions).selectinload(Question.options))
        )
        return result.scalar_one_or_none()

    async def add(self, quiz: Quiz) -> Quiz:
        self.session.add(quiz)
        await self.session.flush()
        return quiz

    async def add_attempt(self, attempt: QuizAttempt) -> QuizAttempt:
        self.session.add(attempt)
        await self.session.flush()
        return attempt
