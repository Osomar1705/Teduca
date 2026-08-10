"""Sembrado idempotente de datos base (roles, logros, recompensas)."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.config import settings
from teduca.modules.achievements.models import Achievement
from teduca.modules.achievements.rules import ACHIEVEMENTS
from teduca.modules.gamification.models import Reward
from teduca.modules.users.models import Role

DEFAULT_ROLES = [
    ("student",         "Estudiante"),
    ("teacher_pending", "Profesor pendiente de aprobación"),
    ("teacher",         "Profesor aprobado"),
    ("admin",           "Administrador"),
]

DEFAULT_REWARDS = [
    ("badge_bronze", "Insignia de Bronce", "Canjeable con 100 puntos.", 100),
    ("badge_silver", "Insignia de Plata", "Canjeable con 300 puntos.", 300),
    ("badge_gold", "Insignia de Oro", "Canjeable con 1000 puntos.", 1000),
]


async def seed(session: AsyncSession) -> None:
    for name, desc in DEFAULT_ROLES:
        if not await session.scalar(select(Role).where(Role.name == name)):
            session.add(Role(name=name, description=desc))

    for adef in ACHIEVEMENTS:
        if not await session.scalar(select(Achievement).where(Achievement.code == adef.code)):
            session.add(
                Achievement(
                    code=adef.code,
                    name=adef.name,
                    description=adef.description,
                    metric=adef.metric,
                    threshold=adef.threshold,
                )
            )

    for code, name, desc, cost in DEFAULT_REWARDS:
        if not await session.scalar(select(Reward).where(Reward.code == code)):
            session.add(Reward(code=code, name=name, description=desc, cost_points=cost))

    await session.commit()

    # Profesores demo del marketplace: solo en entornos de desarrollo/staging.
    # En producción la plataforma parte vacía y los profesores reales se registran.
    if not settings.is_production:
        from teduca.modules.edtech.seed import seed_marketplace

        await seed_marketplace(session)

    # Productos de merch (idempotente).
    from teduca.modules.merch.seed import seed_merch

    await seed_merch(session)

    # Comunicados oficiales (idempotente).
    from teduca.modules.announcements.seed import seed_announcements

    await seed_announcements(session)


async def _main() -> None:
    """Permite sembrar la BD manualmente: `python -m teduca.core.seed`."""
    from teduca.core.database import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        await seed(session)
    print("Seed completado.")


if __name__ == "__main__":
    import asyncio

    asyncio.run(_main())
