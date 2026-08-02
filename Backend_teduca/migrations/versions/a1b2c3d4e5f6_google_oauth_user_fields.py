"""google oauth user fields

Revision ID: a1b2c3d4e5f6
Revises: f4fdabf5be04
Create Date: 2026-08-01 10:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: str | None = 'f4fdabf5be04'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # password_hash pasa a nullable (cuentas de Google no tienen contraseña local).
    op.alter_column('users', 'password_hash', existing_type=sa.String(length=255), nullable=True)
    op.add_column(
        'users',
        sa.Column('auth_provider', sa.String(length=20), nullable=False, server_default='local'),
    )
    op.add_column('users', sa.Column('google_sub', sa.String(length=64), nullable=True))
    op.create_index(op.f('ix_users_google_sub'), 'users', ['google_sub'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_users_google_sub'), table_name='users')
    op.drop_column('users', 'google_sub')
    op.drop_column('users', 'auth_provider')
    op.alter_column('users', 'password_hash', existing_type=sa.String(length=255), nullable=False)
