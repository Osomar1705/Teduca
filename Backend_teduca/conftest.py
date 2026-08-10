"""Fixtures compartidas de pruebas.

Se usa SQLite en memoria (async) y fakeredis para que la suite corra sin
servicios externos (ideal en CI). Las dependencias get_db / get_redis se
sustituyen por versiones de test.
"""

import fakeredis.aioredis
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import teduca.core.redis as redis_module
from teduca.core.database import Base, get_db
from teduca.core.seed import seed
from teduca.main import app

# Importa todos los modelos para que create_all los conozca.
from teduca.modules.achievements import models as _achievements  # noqa: F401
from teduca.modules.analytics import models as _analytics  # noqa: F401
from teduca.modules.assignments import models as _assignments  # noqa: F401
from teduca.modules.courses import models as _courses  # noqa: F401
from teduca.modules.enrollments import models as _enrollments  # noqa: F401
from teduca.modules.gamification import models as _gamification  # noqa: F401
from teduca.modules.lessons import models as _lessons  # noqa: F401
from teduca.modules.machine_learning import models as _ml  # noqa: F401
from teduca.modules.notifications import models as _notifications  # noqa: F401
from teduca.modules.onboarding import models as _onboarding  # noqa: F401
from teduca.modules.quizzes import models as _quizzes  # noqa: F401
from teduca.modules.submissions import models as _submissions  # noqa: F401
from teduca.modules.users import models as _users  # noqa: F401


@pytest.fixture
async def db_sessionmaker():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with maker() as session:
        await seed(session)
    yield maker
    await engine.dispose()


@pytest.fixture
async def client(db_sessionmaker) -> AsyncClient:
    fake = fakeredis.aioredis.FakeRedis(decode_responses=True)
    redis_module._redis = fake

    # Desactiva el rate limiting en tests: el limiter vive a nivel de proceso y
    # su almacenamiento en memoria persiste entre tests, provocando 429 falsos.
    from teduca.modules.auth.router import _limiter as _auth_limiter

    app.state.limiter.enabled = False
    _auth_limiter.enabled = False

    async def _override_get_db():
        async with db_sessionmaker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_db] = _override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    await fake.aclose()
    redis_module._redis = None


@pytest.fixture
async def promote_admin(db_sessionmaker):
    """Devuelve una función async que asciende a admin a un usuario por email."""
    from sqlalchemy import select

    from teduca.modules.users.models import Role, User

    async def _promote(email: str) -> None:
        async with db_sessionmaker() as session:
            user = (
                await session.execute(select(User).where(User.email == email.lower()))
            ).scalar_one()
            role = (await session.execute(select(Role).where(Role.name == "admin"))).scalar_one()
            user.roles.append(role)
            await session.commit()

    return _promote


@pytest.fixture
async def promote_teacher(db_sessionmaker):
    """Devuelve una función async que promueve a teacher a un usuario por email.

    Reemplaza el rol student por teacher directamente en la BD, simulando la
    aprobación de un admin. Necesario porque SELF_ASSIGNABLE_ROLES solo permite
    'student' en el registro normal (correcto por seguridad).
    """
    from sqlalchemy import select

    from teduca.modules.users.models import Role, User

    async def _promote(email: str) -> None:
        async with db_sessionmaker() as session:
            user = (
                await session.execute(select(User).where(User.email == email.lower()))
            ).scalar_one()
            student_role = (
                await session.execute(select(Role).where(Role.name == "student"))
            ).scalar_one()
            teacher_role = (
                await session.execute(select(Role).where(Role.name == "teacher"))
            ).scalar_one()
            if student_role in user.roles:
                user.roles.remove(student_role)
            user.roles.append(teacher_role)
            await session.commit()

    return _promote
