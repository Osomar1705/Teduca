"""file_assets - Supabase Storage references

Revision ID: d1e2f3a4b5c6
Revises: f4fdabf5be04
Create Date: 2026-08-04 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "d1e2f3a4b5c6"
down_revision: str | None = "c3d4e5f6a7b8"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "file_assets",
        sa.Column("uploader_id", sa.Uuid(), nullable=True),
        sa.Column("course_id", sa.Uuid(), nullable=True),
        sa.Column("lesson_id", sa.Uuid(), nullable=True),
        sa.Column("name", sa.String(length=500), nullable=False),
        sa.Column("display_name", sa.String(length=300), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("file_type", sa.String(length=30), nullable=False),
        sa.Column("mime_type", sa.String(length=120), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("bucket", sa.String(length=100), nullable=False),
        sa.Column("storage_path", sa.String(length=1000), nullable=False),
        sa.Column("category", sa.String(length=30), nullable=False),
        sa.Column("access_level", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("extra_metadata", JSONB(), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
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
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["uploader_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Índices para búsqueda y filtrado
    op.create_index(op.f("ix_file_assets_uploader_id"), "file_assets", ["uploader_id"])
    op.create_index(op.f("ix_file_assets_course_id"), "file_assets", ["course_id"])
    op.create_index(op.f("ix_file_assets_lesson_id"), "file_assets", ["lesson_id"])
    op.create_index(op.f("ix_file_assets_bucket"), "file_assets", ["bucket"])
    op.create_index(op.f("ix_file_assets_file_type"), "file_assets", ["file_type"])
    op.create_index(op.f("ix_file_assets_category"), "file_assets", ["category"])
    op.create_index(op.f("ix_file_assets_access_level"), "file_assets", ["access_level"])
    op.create_index(op.f("ix_file_assets_status"), "file_assets", ["status"])

    # Índice compuesto único: cada path es único dentro de su bucket
    op.create_index(
        "ix_file_assets_bucket_path",
        "file_assets",
        ["bucket", "storage_path"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("ix_file_assets_bucket_path", table_name="file_assets")
    op.drop_index(op.f("ix_file_assets_status"), table_name="file_assets")
    op.drop_index(op.f("ix_file_assets_access_level"), table_name="file_assets")
    op.drop_index(op.f("ix_file_assets_category"), table_name="file_assets")
    op.drop_index(op.f("ix_file_assets_file_type"), table_name="file_assets")
    op.drop_index(op.f("ix_file_assets_bucket"), table_name="file_assets")
    op.drop_index(op.f("ix_file_assets_lesson_id"), table_name="file_assets")
    op.drop_index(op.f("ix_file_assets_course_id"), table_name="file_assets")
    op.drop_index(op.f("ix_file_assets_uploader_id"), table_name="file_assets")
    op.drop_table("file_assets")
