"""Servicio de analítica: persistencia del event store y consultas agregadas."""

import uuid
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.analytics.models import Event, UserActivity


class AnalyticsService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def record_event(
        self, name: str, payload: dict[str, Any], user_id: uuid.UUID | None = None
    ) -> Event:
        event = Event(name=name, payload=payload, user_id=user_id)
        self.session.add(event)
        if user_id is not None:
            self.session.add(UserActivity(user_id=user_id, action=name, meta=payload))
        await self.session.flush()
        return event

    async def events_by_name(self) -> dict[str, int]:
        result = await self.session.execute(select(Event.name, func.count()).group_by(Event.name))
        return dict(result.all())

    async def user_activity(
        self, user_id: uuid.UUID, *, offset: int, limit: int
    ) -> tuple[list[UserActivity], int]:
        base = select(UserActivity).where(UserActivity.user_id == user_id)
        total = await self.session.scalar(select(func.count()).select_from(base.subquery()))
        result = await self.session.execute(
            base.order_by(UserActivity.created_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars()), total or 0
