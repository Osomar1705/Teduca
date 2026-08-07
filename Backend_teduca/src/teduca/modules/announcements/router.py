"""Router del módulo announcements."""

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.database import get_db
from teduca.core.dependencies import get_current_user, require_role
from teduca.modules.announcements.models import Announcement
from teduca.modules.announcements.schemas import AnnouncementCreate, AnnouncementRead
from teduca.modules.users.models import User

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("", response_model=list[AnnouncementRead])
async def list_announcements(session: AsyncSession = Depends(get_db)):
    """Lista comunicados activos, primero los fijados."""
    result = await session.execute(
        select(Announcement)
        .where(Announcement.active == True)
        .order_by(Announcement.pinned.desc(), Announcement.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=AnnouncementRead, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    data: AnnouncementCreate,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
):
    """Crea un comunicado (solo admin)."""
    announcement = Announcement(**data.model_dump())
    session.add(announcement)
    await session.commit()
    await session.refresh(announcement)
    return announcement
