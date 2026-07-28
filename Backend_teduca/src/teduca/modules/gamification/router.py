"""Endpoints de gamificación."""

import uuid

from fastapi import APIRouter, status

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.modules.gamification.schemas import (
    GamificationSummary,
    RewardRead,
    UserRewardRead,
)
from teduca.modules.gamification.service import GamificationService

router = APIRouter(prefix="/gamification", tags=["gamification"])


@router.get("/me", response_model=GamificationSummary)
async def my_summary(current_user: CurrentUser, session: DbSession) -> GamificationSummary:
    return GamificationSummary(**await GamificationService(session).get_summary(current_user.id))


@router.get("/rewards", response_model=list[RewardRead])
async def list_rewards(session: DbSession) -> list[RewardRead]:
    return await GamificationService(session).list_rewards()


@router.post(
    "/rewards/{reward_id}/redeem",
    response_model=UserRewardRead,
    status_code=status.HTTP_201_CREATED,
)
async def redeem_reward(
    reward_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> UserRewardRead:
    return await GamificationService(session).redeem_reward(reward_id, current_user.id)
