"""Endpoints de gamificación."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.core.pagination import Page, PaginationParams, pagination_params
from teduca.modules.gamification.schemas import (
    AwardPointsRequest,
    GamificationSummary,
    PointsLedgerRead,
    RankingResponse,
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


@router.get("/ledger", response_model=Page[PointsLedgerRead])
async def my_ledger(
    current_user: CurrentUser,
    session: DbSession,
    params: Annotated[PaginationParams, Depends(pagination_params)],
) -> Page[PointsLedgerRead]:
    items, total = await GamificationService(session).list_ledger(
        current_user.id, offset=params.offset, limit=params.limit
    )
    return Page.create([PointsLedgerRead.model_validate(e) for e in items], total, params)


@router.post("/award", status_code=204)
async def award_points(
    body: AwardPointsRequest, current_user: CurrentUser, session: DbSession
) -> None:
    await GamificationService(session).award_points(
        current_user.id, body.points, body.reason, body.event
    )


@router.get("/ranking", response_model=RankingResponse)
async def get_ranking(current_user: CurrentUser, session: DbSession) -> RankingResponse:
    return await GamificationService(session).get_ranking(current_user.id)


@router.post(
    "/rewards/{reward_id}/redeem",
    response_model=UserRewardRead,
    status_code=status.HTTP_201_CREATED,
)
async def redeem_reward(
    reward_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> UserRewardRead:
    return await GamificationService(session).redeem_reward(reward_id, current_user.id)
