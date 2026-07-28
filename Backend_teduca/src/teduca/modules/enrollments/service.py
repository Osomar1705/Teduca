"""Lógica de negocio de inscripciones.

Emite eventos de dominio (enrollment.created, enrollment.completed) que serán
consumidos por gamificación / analytics / ML en fases posteriores.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.events import DomainEvent, event_bus
from teduca.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from teduca.modules.courses.service import CourseService
from teduca.modules.enrollments.models import Enrollment
from teduca.modules.enrollments.repository import EnrollmentRepository
from teduca.modules.users.models import User


class EnrollmentService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = EnrollmentRepository(session)
        self.courses = CourseService(session)

    async def enroll(self, course_id: uuid.UUID, student: User) -> Enrollment:
        course = await self.courses.get_or_404(course_id)
        if course.status != "published":
            raise ConflictError("El curso no está disponible para inscripción.")
        if await self.repo.get(student.id, course_id):
            raise ConflictError("Ya estás inscrito en este curso.")

        enrollment = await self.repo.add(Enrollment(student_id=student.id, course_id=course_id))
        await event_bus.publish(
            DomainEvent(
                "enrollment.created",
                {"student_id": str(student.id), "course_id": str(course_id)},
                session=self.session,
            )
        )
        return enrollment

    async def list_mine(
        self, student: User, *, offset: int, limit: int
    ) -> tuple[list[Enrollment], int]:
        return await self.repo.list_for_student(student.id, offset=offset, limit=limit)

    async def update_progress(
        self, enrollment_id: uuid.UUID, progress: int, student: User
    ) -> Enrollment:
        enrollment = await self.repo.get_by_id(enrollment_id)
        if enrollment is None:
            raise NotFoundError("Inscripción no encontrada.")
        if enrollment.student_id != student.id:
            raise ForbiddenError("No es tu inscripción.")

        enrollment.progress = progress
        completed_now = progress >= 100 and enrollment.status != "completed"
        if completed_now:
            enrollment.status = "completed"
            enrollment.completed_at = datetime.now(UTC)
        # Flush antes de publicar para que los handlers vean el estado ya persistido.
        await self.session.flush()

        if completed_now:
            await event_bus.publish(
                DomainEvent(
                    "enrollment.completed",
                    {
                        "student_id": str(student.id),
                        "course_id": str(enrollment.course_id),
                    },
                    session=self.session,
                )
            )
        await self.session.refresh(enrollment)
        return enrollment
