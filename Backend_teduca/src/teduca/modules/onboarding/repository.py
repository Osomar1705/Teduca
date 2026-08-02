"""Repositorio de onboarding."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.onboarding.models import UserOnboarding


class OnboardingRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_user(self, user_id: uuid.UUID) -> UserOnboarding | None:
        result = await self.session.execute(
            select(UserOnboarding).where(UserOnboarding.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_or_create(self, user_id: uuid.UUID) -> UserOnboarding:
        obj = await self.get_by_user(user_id)
        if obj is None:
            obj = UserOnboarding(user_id=user_id)
            self.session.add(obj)
            await self.session.flush()
        return obj

    async def username_taken(self, username: str, exclude_user_id: uuid.UUID | None = None) -> bool:
        q = select(UserOnboarding.id).where(UserOnboarding.username == username.lower())
        if exclude_user_id:
            q = q.where(UserOnboarding.user_id != exclude_user_id)
        result = await self.session.execute(q)
        return result.scalar_one_or_none() is not None
