"""Servicio de notificaciones."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import ForbiddenError, NotFoundError
from teduca.modules.notifications.models import Notification


class NotificationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(
        self, user_id: uuid.UUID, *, title: str, message: str, type: str = "info"
    ) -> Notification:
        notification = Notification(user_id=user_id, title=title, message=message, type=type)
        self.session.add(notification)
        await self.session.flush()
        return notification

    async def list_for_user(
        self, user_id: uuid.UUID, *, offset: int, limit: int, unread_only: bool = False
    ) -> tuple[list[Notification], int]:
        base = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            base = base.where(Notification.read_at.is_(None))
        total = await self.session.scalar(select(func.count()).select_from(base.subquery()))
        result = await self.session.execute(
            base.order_by(Notification.created_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars()), total or 0

    async def mark_all_read(self, user_id: uuid.UUID) -> None:
        result = await self.session.execute(
            select(Notification).where(
                Notification.user_id == user_id, Notification.read_at.is_(None)
            )
        )
        now = datetime.now(UTC)
        for notification in result.scalars():
            notification.read_at = now
        await self.session.flush()

    async def mark_read(self, notification_id: uuid.UUID, user_id: uuid.UUID) -> Notification:
        notification = await self.session.get(Notification, notification_id)
        if notification is None:
            raise NotFoundError("Notificación no encontrada.")
        if notification.user_id != user_id:
            raise ForbiddenError("No es tu notificación.")
        if notification.read_at is None:
            notification.read_at = datetime.now(UTC)
            await self.session.flush()
        return notification
