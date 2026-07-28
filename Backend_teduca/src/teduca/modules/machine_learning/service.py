"""Servicio de ML: arma features, invoca el provider y cachea recomendaciones.

Representa el rol del "worker": en producción esta lógica correría fuera de
proceso; aquí se expone también de forma síncrona para poder refrescar bajo
demanda mientras no exista la infraestructura de colas.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.courses.models import Course
from teduca.modules.enrollments.models import Enrollment
from teduca.modules.gamification.models import PointsLedger
from teduca.modules.machine_learning.models import MLRecommendation
from teduca.modules.machine_learning.provider import (
    MLProvider,
    UserFeatures,
    get_ml_provider,
)
from teduca.modules.quizzes.models import QuizAttempt


class MLService:
    def __init__(self, session: AsyncSession, provider: MLProvider | None = None) -> None:
        self.session = session
        self.provider = provider or get_ml_provider()

    async def _build_features(self, user_id: uuid.UUID) -> UserFeatures:
        total_points = int(
            await self.session.scalar(
                select(func.coalesce(func.sum(PointsLedger.points), 0)).where(
                    PointsLedger.user_id == user_id
                )
            )
            or 0
        )
        courses_completed = int(
            await self.session.scalar(
                select(func.count())
                .select_from(Enrollment)
                .where(Enrollment.student_id == user_id, Enrollment.status == "completed")
            )
            or 0
        )
        quizzes_passed = int(
            await self.session.scalar(
                select(func.count())
                .select_from(QuizAttempt)
                .where(QuizAttempt.student_id == user_id, QuizAttempt.passed.is_(True))
            )
            or 0
        )
        enrolled = await self.session.execute(
            select(Enrollment.course_id).where(Enrollment.student_id == user_id)
        )
        return UserFeatures(
            user_id=str(user_id),
            total_points=total_points,
            courses_completed=courses_completed,
            quizzes_passed=quizzes_passed,
            enrolled_course_ids=[str(c) for c in enrolled.scalars()],
        )

    async def _candidate_courses(self) -> list[dict]:
        result = await self.session.execute(
            select(Course).where(Course.status == "published", Course.deleted_at.is_(None))
        )
        return [{"id": str(c.id), "title": c.title, "student_count": 0} for c in result.scalars()]

    async def refresh_recommendations(self, user_id: uuid.UUID) -> list[MLRecommendation]:
        """Recalcula y reemplaza las recomendaciones cacheadas del usuario."""
        features = await self._build_features(user_id)
        candidates = await self._candidate_courses()

        recs = await self.provider.recommend_content(features, candidates)
        recs.append(await self.provider.predict_dropout(features))

        # Reemplaza el cache anterior.
        await self.session.execute(
            delete(MLRecommendation).where(MLRecommendation.user_id == user_id)
        )
        rows = [
            MLRecommendation(
                user_id=user_id,
                kind=r.kind,
                payload=r.payload,
                score=r.score,
                rank=r.rank,
                model_name=r.model_name,
                model_version=r.model_version,
                created_at=datetime.now(UTC),
            )
            for r in recs
        ]
        self.session.add_all(rows)
        await self.session.flush()
        return rows

    async def list_recommendations(
        self, user_id: uuid.UUID, kind: str | None = None
    ) -> list[MLRecommendation]:
        query = select(MLRecommendation).where(MLRecommendation.user_id == user_id)
        if kind:
            query = query.where(MLRecommendation.kind == kind)
        result = await self.session.execute(
            query.order_by(MLRecommendation.kind, MLRecommendation.rank)
        )
        return list(result.scalars())
