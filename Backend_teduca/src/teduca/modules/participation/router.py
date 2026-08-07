"""Endpoints de participation."""

import uuid

from fastapi import APIRouter
from sqlalchemy import func, select

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.modules.community.models import Post
from teduca.modules.enrollments.models import Enrollment
from teduca.modules.participation.schemas import ParticipationStats
from teduca.modules.submissions.models import Submission

router = APIRouter(prefix="/participation", tags=["participation"])


@router.get("/me", response_model=ParticipationStats)
async def my_participation(
    current_user: CurrentUser, session: DbSession
) -> ParticipationStats:
    user_id: uuid.UUID = current_user.id

    # Cursos matriculados
    courses_enrolled_result = await session.execute(
        select(func.count()).select_from(Enrollment).where(Enrollment.student_id == user_id)
    )
    courses_enrolled: int = courses_enrolled_result.scalar_one() or 0

    # Horas aprendidas: estimamos 1 h por cada 10 % de progreso por curso
    # (enrollments.progress es 0-100)
    hours_result = await session.execute(
        select(func.coalesce(func.sum(Enrollment.progress), 0))
        .where(Enrollment.student_id == user_id)
    )
    total_progress: int = hours_result.scalar_one() or 0
    hours_learned = total_progress // 10

    # Tareas completadas (submissions con status graded o submitted)
    assignments_result = await session.execute(
        select(func.count())
        .select_from(Submission)
        .where(
            Submission.student_id == user_id,
            Submission.status.in_(["submitted", "graded"]),
        )
    )
    assignments_completed: int = assignments_result.scalar_one() or 0

    # Posts en comunidad
    posts_result = await session.execute(
        select(func.count()).select_from(Post).where(Post.author_id == user_id)
    )
    comments_posted: int = posts_result.scalar_one() or 0

    # Cursos completados (progress == 100) → certificados
    certs_result = await session.execute(
        select(func.count())
        .select_from(Enrollment)
        .where(Enrollment.student_id == user_id, Enrollment.progress == 100)
    )
    certificates_earned: int = certs_result.scalar_one() or 0

    return ParticipationStats(
        coursesEnrolled=courses_enrolled,
        hoursLearned=hours_learned,
        assignmentsCompleted=assignments_completed,
        helpGiven=0,
        commentsPosted=comments_posted,
        certificatesEarned=certificates_earned,
        ranking=None,
    )
