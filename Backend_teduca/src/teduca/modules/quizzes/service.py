"""Lógica de negocio de quizzes, incluida la autocorrección de intentos."""

import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.events import DomainEvent, event_bus
from teduca.core.exceptions import NotFoundError, ValidationError
from teduca.modules.courses.service import CourseService
from teduca.modules.quizzes.models import (
    AnswerOption,
    Question,
    QuestionResponse,
    Quiz,
    QuizAttempt,
)
from teduca.modules.quizzes.repository import QuizRepository
from teduca.modules.quizzes.schemas import AttemptSubmit, QuizCreate
from teduca.modules.users.models import User


class QuizService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = QuizRepository(session)
        self.courses = CourseService(session)

    async def get_or_404(self, quiz_id: uuid.UUID) -> Quiz:
        quiz = await self.repo.get_with_questions(quiz_id)
        if quiz is None:
            raise NotFoundError("Quiz no encontrado.")
        return quiz

    async def create(self, course_id: uuid.UUID, data: QuizCreate, teacher: User) -> Quiz:
        course = await self.courses.get_or_404(course_id)
        self.courses._assert_owner(course, teacher)

        quiz = Quiz(
            course_id=course_id,
            lesson_id=data.lesson_id,
            title=data.title,
            description=data.description,
            pass_score=data.pass_score,
        )
        for q in data.questions:
            if sum(o.is_correct for o in q.options) != 1:
                raise ValidationError(
                    "Cada pregunta 'single' debe tener exactamente una opción correcta."
                )
            question = Question(text=q.text, kind=q.kind, order=q.order, points=q.points)
            question.options = [
                AnswerOption(text=o.text, is_correct=o.is_correct) for o in q.options
            ]
            quiz.questions.append(question)

        await self.repo.add(quiz)
        return await self.get_or_404(quiz.id)

    async def submit_attempt(
        self, quiz_id: uuid.UUID, data: AttemptSubmit, student: User
    ) -> QuizAttempt:
        quiz = await self.get_or_404(quiz_id)

        # Índices para corrección
        questions = {q.id: q for q in quiz.questions}
        correct_option = {
            q.id: next((o.id for o in q.options if o.is_correct), None) for q in quiz.questions
        }
        answered = {a.question_id: a.selected_option_id for a in data.answers}

        total_points = sum(q.points for q in quiz.questions)
        earned = 0
        responses: list[QuestionResponse] = []
        for qid, question in questions.items():
            selected = answered.get(qid)
            is_correct = selected is not None and selected == correct_option[qid]
            if is_correct:
                earned += question.points
            responses.append(
                QuestionResponse(
                    question_id=qid,
                    selected_option_id=selected,
                    is_correct=is_correct,
                )
            )

        score = round(earned / total_points * 100) if total_points else 0
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            student_id=student.id,
            score=score,
            passed=score >= quiz.pass_score,
            completed_at=datetime.now(UTC),
            responses=responses,
        )
        await self.repo.add_attempt(attempt)
        await event_bus.publish(
            DomainEvent(
                "quiz.completed",
                {
                    "student_id": str(student.id),
                    "quiz_id": str(quiz_id),
                    "score": score,
                    "passed": attempt.passed,
                },
                session=self.session,
            )
        )
        return attempt
