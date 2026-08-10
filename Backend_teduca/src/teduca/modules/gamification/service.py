"""Servicio de gamificación: puntos (ledger) y rachas."""

import uuid
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import ConflictError, NotFoundError
from teduca.modules.gamification.models import PointsLedger, Reward, Streak, UserReward
from teduca.modules.gamification.schemas import RankingEntry, RankingResponse
from teduca.modules.users.models import User


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

    async def claim_daily_login(self, user_id: uuid.UUID) -> bool:
        """Otorga Orbits por ingreso diario si no se han reclamado hoy.

        Retorna True si se otorgaron puntos, False si ya se reclamaron hoy.
        La deduplicación se hace en BD: busca un asiento daily_login del día.
        """
        from datetime import timezone
        today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
        already = await self.session.scalar(
            select(PointsLedger).where(
                PointsLedger.user_id == user_id,
                PointsLedger.event_name == "daily_login",
                PointsLedger.created_at >= today_start,
            )
        )
        if already is not None:
            return False
        await self.award_points(user_id, 10, "Ingreso diario", "daily_login")
        await self.touch_streak(user_id)
        await self.session.commit()
        return True

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

    async def get_ranking(self, current_user_id: uuid.UUID | None, limit: int = 20) -> RankingResponse:
        """Top usuarios por total de puntos, con posición del usuario actual."""
        # Subconsulta: total de puntos por usuario
        points_subq = (
            select(
                PointsLedger.user_id,
                func.coalesce(func.sum(PointsLedger.points), 0).label("total_points"),
            )
            .group_by(PointsLedger.user_id)
            .subquery()
        )

        # JOIN con users y streaks
        stmt = (
            select(
                User.id,
                User.name,
                User.avatar,
                points_subq.c.total_points,
                func.coalesce(Streak.current_streak, 0).label("current_streak"),
            )
            .join(points_subq, User.id == points_subq.c.user_id)
            .outerjoin(Streak, User.id == Streak.user_id)
            .where(User.is_active.is_(True), User.deleted_at.is_(None))
            .order_by(points_subq.c.total_points.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        rows = result.fetchall()

        entries: list[RankingEntry] = []
        current_user_position: int | None = None
        for i, row in enumerate(rows, start=1):
            entries.append(
                RankingEntry(
                    position=i,
                    user_id=row.id,
                    name=row.name,
                    avatar_url=row.avatar,
                    total_points=int(row.total_points),
                    current_streak=int(row.current_streak),
                )
            )
            if current_user_id and row.id == current_user_id:
                current_user_position = i

        return RankingResponse(entries=entries, current_user_position=current_user_position)

    async def get_summary(self, user_id: uuid.UUID) -> dict:
        streak = await self._get_or_create_streak(user_id)
        return {
            "total_points": await self.total_points(user_id),
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "last_active_date": streak.last_active_date,
        }
