"""onboarding table

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-08-02 10:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "c3d4e5f6a7b8"
down_revision: str | None = "b2c3d4e5f6a7"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "user_onboarding",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("full_name", sa.String(120), nullable=True),
        sa.Column("username", sa.String(30), nullable=True),
        sa.Column("birth_date", sa.Date(), nullable=True),
        sa.Column("is_edu_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("institution", sa.String(120), nullable=True),
        sa.Column("career", sa.String(120), nullable=True),
        sa.Column("academic_year", sa.String(30), nullable=True),
        sa.Column("goals", postgresql.ARRAY(sa.Text()), nullable=False, server_default="{}"),
        sa.Column("subject_tags", postgresql.ARRAY(sa.Text()), nullable=False, server_default="{}"),
        sa.Column("project_interests", postgresql.ARRAY(sa.Text()), nullable=False, server_default="{}"),
        sa.Column("learning_styles", postgresql.ARRAY(sa.Text()), nullable=False, server_default="{}"),
        sa.Column("current_step", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("completed", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_user_onboarding_user_id", "user_onboarding", ["user_id"])
    op.create_index("ix_user_onboarding_username", "user_onboarding", ["username"])


def downgrade() -> None:
    op.drop_index("ix_user_onboarding_username", table_name="user_onboarding")
    op.drop_index("ix_user_onboarding_user_id", table_name="user_onboarding")
    op.drop_table("user_onboarding")
