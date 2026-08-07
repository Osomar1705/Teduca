"""Endpoints de notificaciones."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.core.pagination import Page, PaginationParams, pagination_params
from teduca.modules.notifications.schemas import NotificationRead
from teduca.modules.notifications.service import NotificationService

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=Page[NotificationRead])
async def list_notifications(
    current_user: CurrentUser,
    session: DbSession,
    params: Annotated[PaginationParams, Depends(pagination_params)],
    unread_only: bool = False,
) -> Page[NotificationRead]:
    items, total = await NotificationService(session).list_for_user(
        current_user.id, offset=params.offset, limit=params.limit, unread_only=unread_only
    )
    return Page.create([NotificationRead.model_validate(n) for n in items], total, params)


@router.patch("/read-all", status_code=204)
async def mark_all_read(current_user: CurrentUser, session: DbSession) -> None:
    await NotificationService(session).mark_all_read(current_user.id)


@router.patch("/{notification_id}/read", response_model=NotificationRead)
async def mark_read(
    notification_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> NotificationRead:
    return await NotificationService(session).mark_read(notification_id, current_user.id)
