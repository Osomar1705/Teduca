"""Lógica de negocio de entregas y calificación."""

import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.events import DomainEvent, event_bus
from teduca.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from teduca.modules.assignments.service import AssignmentService
from teduca.modules.courses.service import CourseService
from teduca.modules.submissions.models import Submission
from teduca.modules.submissions.repository import SubmissionRepository
from teduca.modules.submissions.schemas import GradeRequest, SubmissionCreate
from teduca.modules.users.models import User


class SubmissionService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = SubmissionRepository(session)
        self.assignments = AssignmentService(session)
        self.courses = CourseService(session)

    async def submit(
        self, assignment_id: uuid.UUID, data: SubmissionCreate, student: User
    ) -> Submission:
        assignment = await self.assignments.get_or_404(assignment_id)
        if await self.repo.get(assignment_id, student.id):
            raise ConflictError("Ya tienes una entrega para esta tarea.")

        now = datetime.now(UTC)
        is_late = assignment.due_date is not None and now > assignment.due_date
        submission = await self.repo.add(
            Submission(
                assignment_id=assignment_id,
                student_id=student.id,
                content=data.content,
                file_url=data.file_url,
                status="late" if is_late else "submitted",
                submitted_at=now,
            )
        )
        await event_bus.publish(
            DomainEvent(
                "submission.created",
                {"student_id": str(student.id), "assignment_id": str(assignment_id)},
                session=self.session,
            )
        )
        return submission

    async def list_for_assignment(
        self, assignment_id: uuid.UUID, teacher: User
    ) -> list[Submission]:
        assignment = await self.assignments.get_or_404(assignment_id)
        course = await self.courses.get_or_404(assignment.course_id)
        self.courses._assert_owner(course, teacher)
        return await self.repo.list_by_assignment(assignment_id)

    async def grade(
        self, submission_id: uuid.UUID, data: GradeRequest, teacher: User
    ) -> Submission:
        submission = await self.repo.get_by_id(submission_id)
        if submission is None:
            raise NotFoundError("Entrega no encontrada.")
        assignment = await self.assignments.get_or_404(submission.assignment_id)
        course = await self.courses.get_or_404(assignment.course_id)
        self.courses._assert_owner(course, teacher)

        if data.score > assignment.max_score:
            raise ConflictError(f"La nota no puede superar el máximo ({assignment.max_score}).")

        submission.score = data.score
        submission.feedback = data.feedback
        submission.status = "graded"
        submission.graded_at = datetime.now(UTC)
        await self.session.flush()
        await self.session.refresh(submission)
        await event_bus.publish(
            DomainEvent(
                "submission.graded",
                {
                    "student_id": str(submission.student_id),
                    "assignment_id": str(submission.assignment_id),
                    "score": data.score,
                },
                session=self.session,
            )
        )
        return submission

    async def get_owned(self, submission_id: uuid.UUID, user: User) -> Submission:
        submission = await self.repo.get_by_id(submission_id)
        if submission is None:
            raise NotFoundError("Entrega no encontrada.")
        if submission.student_id != user.id and "admin" not in user.role_names:
            # Los profesores dueños del curso también pueden verla.
            assignment = await self.assignments.get_or_404(submission.assignment_id)
            course = await self.courses.get_or_404(assignment.course_id)
            if course.teacher_id != user.id:
                raise ForbiddenError("No puedes ver esta entrega.")
        return submission
