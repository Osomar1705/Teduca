"""Seed del primer comunicado oficial TEDUCA."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.announcements.models import Announcement, AnnouncementType


async def seed_announcements(session: AsyncSession) -> None:
    """Crea el comunicado inicial si aún no existe."""
    existing = await session.scalar(
        select(Announcement).where(Announcement.title == "TEDUCA está aquí")
    )
    if existing is not None:
        return

    session.add(
        Announcement(
            title="TEDUCA está aquí",
            body="Bienvenidos a TEDUCA, la plataforma educativa que conecta estudiantes con los mejores profesores. Estamos oficialmente en línea.",
            image="/anuncios/8a56cf5f-e478-4c36-a204-81caf771c4c2.jpeg",
            type=AnnouncementType.info,
            pinned=True,
            active=True,
        )
    )
    await session.commit()
