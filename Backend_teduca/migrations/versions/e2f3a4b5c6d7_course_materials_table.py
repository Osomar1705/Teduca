"""course_materials table

Revision ID: e2f3a4b5c6d7
Revises: b2c3d4e5f6a7
Create Date: 2026-08-10 00:00:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "e2f3a4b5c6d7"
down_revision: str | None = "35e6e0bb0b3c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "course_materials",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("teacher_profile_id", sa.UUID(), nullable=False),
        sa.Column("marketplace_course_id", sa.UUID(), nullable=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("material_type", sa.String(20), nullable=False, server_default="link"),
        sa.Column("url", sa.String(2048), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["teacher_profile_id"],
            ["teacher_profiles.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["marketplace_course_id"],
            ["marketplace_courses.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_course_materials_teacher_profile_id",
        "course_materials",
        ["teacher_profile_id"],
    )
    op.create_index(
        "ix_course_materials_marketplace_course_id",
        "course_materials",
        ["marketplace_course_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_course_materials_marketplace_course_id", table_name="course_materials")
    op.drop_index("ix_course_materials_teacher_profile_id", table_name="course_materials")
    op.drop_table("course_materials")
