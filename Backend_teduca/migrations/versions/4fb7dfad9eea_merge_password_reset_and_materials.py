"""merge_password_reset_and_materials

Revision ID: 4fb7dfad9eea
Revises: e1f2a3b4c5d6, f5a6b7c8d9e0
Create Date: 2026-08-10 11:09:35.969574

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '4fb7dfad9eea'
down_revision: str | None = ('e1f2a3b4c5d6', 'f5a6b7c8d9e0')
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
