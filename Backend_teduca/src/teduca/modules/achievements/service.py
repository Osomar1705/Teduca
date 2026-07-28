"""Servicio de logros: cálculo de métricas y desbloqueo."""

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.achievements.models import Achievement, UserAchievement
from teduca.modules.achievements.rules import ACHIEVEMENTS, METRICS_BY_EVENT
from teduca.modules.enrollments.models import Enrollment
from teduca.modules.gamification.models import PointsLedger
from teduca.modules.quizzes.models import QuizAttempt


class AchievementService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def _metric(self, name: str, user_id: uuid.UUID) -> int:
        if name == "courses_completed":
            return int(
                await self.session.scalar(
                    select(func.count())
                    .select_from(Enrollment)
                    .where(
                        Enrollment.student_id == user_id,
                        Enrollment.status == "completed",
                    )
                )
                or 0
            )
        if name == "quizzes_passed":
            return int(
                await self.session.scalar(
                    select(func.count())
                    .select_from(QuizAttempt)
                    .where(QuizAttempt.student_id == user_id, QuizAttempt.passed.is_(True))
                )
                or 0
            )
        if name == "total_points":
            return int(
                await self.session.scalar(
                    select(func.coalesce(func.sum(PointsLedger.points), 0)).where(
                        PointsLedger.user_id == user_id
                    )
                )
                or 0
            )
        return 0

    async def _unlocked_codes(self, user_id: uuid.UUID) -> set[str]:
        result = await self.session.execute(
            select(Achievement.code)
            .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
            .where(UserAchievement.user_id == user_id)
        )
        return set(result.scalars())

    async def evaluate(self, user_id: uuid.UUID, event_name: str) -> list[Achievement]:
        """Reevalúa los logros afectados por el evento; devuelve los recién desbloqueados."""
        relevant_metrics = METRICS_BY_EVENT.get(event_name)
        already = await self._unlocked_codes(user_id)
        metric_cache: dict[str, int] = {}
        newly: list[Achievement] = []

        for adef in ACHIEVEMENTS:
            if adef.code in already:
                continue
            if relevant_metrics is not None and adef.metric not in relevant_metrics:
                continue
            if adef.metric not in metric_cache:
                metric_cache[adef.metric] = await self._metric(adef.metric, user_id)
            if metric_cache[adef.metric] >= adef.threshold:
                achievement = await self._get_by_code(adef.code)
                if achievement is None:
                    continue
                self.session.add(UserAchievement(user_id=user_id, achievement_id=achievement.id))
                newly.append(achievement)

        if newly:
            await self.session.flush()
        return newly

    async def _get_by_code(self, code: str) -> Achievement | None:
        result = await self.session.execute(select(Achievement).where(Achievement.code == code))
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: uuid.UUID) -> list[Achievement]:
        result = await self.session.execute(
            select(Achievement)
            .join(UserAchievement, UserAchievement.achievement_id == Achievement.id)
            .where(UserAchievement.user_id == user_id)
            .order_by(UserAchievement.unlocked_at.desc())
        )
        return list(result.scalars())
