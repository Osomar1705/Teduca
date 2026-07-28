"""Endpoints de machine learning (lectura de recomendaciones cacheadas)."""

from fastapi import APIRouter, status

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.modules.machine_learning.schemas import RecommendationRead
from teduca.modules.machine_learning.service import MLService

router = APIRouter(prefix="/ml", tags=["machine_learning"])


@router.get("/recommendations/me", response_model=list[RecommendationRead])
async def my_recommendations(
    current_user: CurrentUser, session: DbSession, kind: str | None = None
) -> list[RecommendationRead]:
    return await MLService(session).list_recommendations(current_user.id, kind)


@router.post(
    "/recommendations/me/refresh",
    response_model=list[RecommendationRead],
    status_code=status.HTTP_201_CREATED,
)
async def refresh_recommendations(
    current_user: CurrentUser, session: DbSession
) -> list[RecommendationRead]:
    """Recalcula las recomendaciones bajo demanda (rol de worker en línea)."""
    return await MLService(session).refresh_recommendations(current_user.id)
