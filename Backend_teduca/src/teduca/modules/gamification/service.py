"""Servicio de gamificación: puntos (ledger) y rachas."""

import uuid
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import ConflictError, NotFoundError
from teduca.modules.gamification.models import PointsLedger, Reward, Streak, UserReward


class GamificationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def award_points(
        self, user_id: uuid.UUID, points: int, reason: str, event_name: str | None = None
    ) -> None:
        self.session.add(
            PointsLedger(user_id=user_id, points=points, reason=reason, event_name=event_name)
        )
        await self.session.flush()

    async def total_points(self, user_id: uuid.UUID) -> int:
        total = await self.session.scalar(
            select(func.coalesce(func.sum(PointsLedger.points), 0)).where(
                PointsLedger.user_id == user_id
            )
        )
        return int(total or 0)

    async def _get_or_create_streak(self, user_id: uuid.UUID) -> Streak:
        result = await self.session.execute(select(Streak).where(Streak.user_id == user_id))
        streak = result.scalar_one_or_none()
        if streak is None:
            streak = Streak(user_id=user_id, current_streak=0, longest_streak=0)
            self.session.add(streak)
            await self.session.flush()
        return streak

    async def touch_streak(self, user_id: uuid.UUID) -> Streak:
        """Actualiza la racha por actividad del día."""
        streak = await self._get_or_create_streak(user_id)
        today = date.today()
        last = streak.last_active_date

        if last == today:
            return streak  # ya contado hoy
        if last == today - timedelta(days=1):
            streak.current_streak += 1
        else:
            streak.current_streak = 1
        streak.last_active_date = today
        streak.longest_streak = max(streak.longest_streak, streak.current_streak)
        await self.session.flush()
        return streak

    async def list_rewards(self) -> list[Reward]:
        result = await self.session.execute(select(Reward).order_by(Reward.cost_points))
        return list(result.scalars())

    async def redeem_reward(self, reward_id: uuid.UUID, user_id: uuid.UUID) -> UserReward:
        reward = await self.session.get(Reward, reward_id)
        if reward is None:
            raise NotFoundError("Recompensa no encontrada.")
        already = await self.session.scalar(
            select(UserReward).where(
                UserReward.user_id == user_id, UserReward.reward_id == reward_id
            )
        )
        if already:
            raise ConflictError("Ya canjeaste esta recompensa.")
        if await self.total_points(user_id) < reward.cost_points:
            raise ConflictError("No tienes puntos suficientes.")

        # Debita los puntos con un asiento negativo en el ledger (auditable).
        await self.award_points(
            user_id, -reward.cost_points, f"Canje: {reward.code}", "reward.redeemed"
        )
        user_reward = UserReward(
            user_id=user_id, reward_id=reward_id, redeemed_at=datetime.now(UTC)
        )
        self.session.add(user_reward)
        await self.session.flush()
        return user_reward

    async def list_ledger(
        self, user_id: uuid.UUID, *, offset: int = 0, limit: int = 50
    ) -> tuple[list[PointsLedger], int]:
        base = select(PointsLedger).where(PointsLedger.user_id == user_id)
        total = await self.session.scalar(select(func.count()).select_from(base.subquery()))
        result = await self.session.execute(
            base.order_by(PointsLedger.created_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars()), int(total or 0)

    async def get_summary(self, user_id: uuid.UUID) -> dict:
        streak = await self._get_or_create_streak(user_id)
        return {
            "total_points": await self.total_points(user_id),
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "last_active_date": streak.last_active_date,
        }
