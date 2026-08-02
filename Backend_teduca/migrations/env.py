"""Entorno Alembic (async). Autogenera migraciones desde Base.metadata."""

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.engine import Connection

from teduca.core.config import settings
from teduca.core.database import Base

# Importa aquí los modelos de cada módulo para que Alembic los detecte.
from teduca.modules.achievements import models as _achievements  # noqa: E402, F401
from teduca.modules.analytics import models as _analytics  # noqa: E402, F401
from teduca.modules.assignments import models as _assignments  # noqa: E402, F401
from teduca.modules.courses import models as _courses  # noqa: E402, F401
from teduca.modules.edtech import models as _edtech  # noqa: E402, F401
from teduca.modules.enrollments import models as _enrollments  # noqa: E402, F401
from teduca.modules.gamification import models as _gamification  # noqa: E402, F401
from teduca.modules.lessons import models as _lessons  # noqa: E402, F401
from teduca.modules.machine_learning import models as _ml  # noqa: E402, F401
from teduca.modules.notifications import models as _notifications  # noqa: E402, F401
from teduca.modules.quizzes import models as _quizzes  # noqa: E402, F401
from teduca.modules.submissions import models as _submissions  # noqa: E402, F401
from teduca.modules.users import models as _users  # noqa: E402, F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    # Reutiliza el engine del proyecto: ya aplica SSL y statement_cache_size=0
    # cuando el host no es local (necesario para Neon/pgBouncer).
    from teduca.core.database import engine as connectable

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_async_migrations())
