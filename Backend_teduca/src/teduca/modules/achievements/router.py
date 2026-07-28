"""Endpoints de logros."""

from fastapi import APIRouter
from sqlalchemy import select

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.modules.achievements.models import Achievement
from teduca.modules.achievements.schemas import AchievementRead
from teduca.modules.achievements.service import AchievementService

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("", response_model=list[AchievementRead])
async def list_catalog(session: DbSession) -> list[AchievementRead]:
    result = await session.execute(select(Achievement).order_by(Achievement.threshold))
    return list(result.scalars())


@router.get("/me", response_model=list[AchievementRead])
async def my_achievements(current_user: CurrentUser, session: DbSession) -> list[AchievementRead]:
    return await AchievementService(session).list_for_user(current_user.id)
