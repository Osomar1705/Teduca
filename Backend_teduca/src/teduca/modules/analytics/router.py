"""Endpoints de analítica."""

from typing import Annotated

from fastapi import APIRouter, Depends

from teduca.core.dependencies import CurrentUser, DbSession, require_role
from teduca.core.pagination import Page, PaginationParams, pagination_params
from teduca.modules.analytics.schemas import AnalyticsOverview, UserActivityRead
from teduca.modules.analytics.service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get(
    "/overview",
    response_model=AnalyticsOverview,
    dependencies=[Depends(require_role("admin"))],
)
async def overview(session: DbSession) -> AnalyticsOverview:
    by_name = await AnalyticsService(session).events_by_name()
    return AnalyticsOverview(events_by_name=by_name, total_events=sum(by_name.values()))


@router.get("/me/activity", response_model=Page[UserActivityRead])
async def my_activity(
    current_user: CurrentUser,
    session: DbSession,
    params: Annotated[PaginationParams, Depends(pagination_params)],
) -> Page[UserActivityRead]:
    items, total = await AnalyticsService(session).user_activity(
        current_user.id, offset=params.offset, limit=params.limit
    )
    return Page.create([UserActivityRead.model_validate(a) for a in items], total, params)
