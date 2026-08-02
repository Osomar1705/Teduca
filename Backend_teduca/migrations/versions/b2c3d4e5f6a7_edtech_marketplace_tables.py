"""edtech marketplace tables

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-08-01 11:00:00.000000

"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = 'b2c3d4e5f6a7'
down_revision: str | None = 'a1b2c3d4e5f6'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _timestamps() -> list[sa.Column]:
    return [
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column(
            'created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'),
            nullable=False,
        ),
        sa.Column(
            'updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'),
            nullable=False,
        ),
    ]


def upgrade() -> None:
    op.create_table(
        'teacher_profiles',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('specialty', sa.String(length=160), server_default='', nullable=False),
        sa.Column('bio', sa.Text(), server_default='', nullable=False),
        sa.Column('experience_years', sa.Integer(), server_default='0', nullable=False),
        sa.Column('university', sa.String(length=160), server_default='', nullable=False),
        sa.Column('modality', sa.String(length=20), server_default='virtual', nullable=False),
        sa.Column('hourly_price', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('currency', sa.String(length=8), server_default='USD', nullable=False),
        sa.Column('location', sa.String(length=160), server_default='', nullable=False),
        sa.Column('languages', sa.JSON(), nullable=False),
        sa.Column('availability', sa.JSON(), nullable=False),
        sa.Column('categories', sa.JSON(), nullable=False),
        sa.Column('socials', sa.JSON(), nullable=False),
        sa.Column('is_published', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('rating', sa.Numeric(3, 2), server_default='0', nullable=False),
        sa.Column('reviews_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('students_count', sa.Integer(), server_default='0', nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id'),
    )
    op.create_index(
        op.f('ix_teacher_profiles_user_id'), 'teacher_profiles', ['user_id'], unique=True
    )
    op.create_index(
        op.f('ix_teacher_profiles_is_published'), 'teacher_profiles', ['is_published'],
        unique=False,
    )

    op.create_table(
        'marketplace_courses',
        sa.Column('teacher_profile_id', sa.Uuid(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('image', sa.String(length=512), server_default='', nullable=False),
        sa.Column('category', sa.String(length=60), server_default='general', nullable=False),
        sa.Column('description', sa.Text(), server_default='', nullable=False),
        sa.Column('level', sa.String(length=20), server_default='beginner', nullable=False),
        sa.Column('duration_hours', sa.Integer(), server_default='0', nullable=False),
        sa.Column('price', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('currency', sa.String(length=8), server_default='USD', nullable=False),
        sa.Column('rating', sa.Numeric(3, 2), server_default='0', nullable=False),
        sa.Column('reviews_count', sa.Integer(), server_default='0', nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(
            ['teacher_profile_id'], ['teacher_profiles.id'], ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_marketplace_courses_teacher_profile_id'), 'marketplace_courses',
        ['teacher_profile_id'], unique=False,
    )

    op.create_table(
        'favorites',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('teacher_profile_id', sa.Uuid(), nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(
            ['teacher_profile_id'], ['teacher_profiles.id'], ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'teacher_profile_id', name='uq_favorite'),
    )
    op.create_index(op.f('ix_favorites_user_id'), 'favorites', ['user_id'], unique=False)
    op.create_index(
        op.f('ix_favorites_teacher_profile_id'), 'favorites', ['teacher_profile_id'],
        unique=False,
    )

    op.create_table(
        'swipes',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('teacher_profile_id', sa.Uuid(), nullable=False),
        sa.Column('direction', sa.String(length=8), nullable=False),
        sa.Column('matched', sa.Boolean(), server_default=sa.false(), nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(
            ['teacher_profile_id'], ['teacher_profiles.id'], ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'teacher_profile_id', name='uq_swipe'),
    )
    op.create_index(op.f('ix_swipes_user_id'), 'swipes', ['user_id'], unique=False)
    op.create_index(
        op.f('ix_swipes_teacher_profile_id'), 'swipes', ['teacher_profile_id'], unique=False
    )

    op.create_table(
        'reservations',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('teacher_profile_id', sa.Uuid(), nullable=False),
        sa.Column('marketplace_course_id', sa.Uuid(), nullable=True),
        sa.Column('date', sa.String(length=20), nullable=False),
        sa.Column('time', sa.String(length=10), nullable=False),
        sa.Column('modality', sa.String(length=20), server_default='virtual', nullable=False),
        sa.Column('price', sa.Numeric(10, 2), server_default='0', nullable=False),
        sa.Column('currency', sa.String(length=8), server_default='USD', nullable=False),
        sa.Column('status', sa.String(length=20), server_default='pending', nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(
            ['teacher_profile_id'], ['teacher_profiles.id'], ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(
            ['marketplace_course_id'], ['marketplace_courses.id'], ondelete='SET NULL'
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_reservations_user_id'), 'reservations', ['user_id'], unique=False
    )
    op.create_index(
        op.f('ix_reservations_teacher_profile_id'), 'reservations', ['teacher_profile_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_reservations_status'), 'reservations', ['status'], unique=False
    )

    op.create_table(
        'chat_threads',
        sa.Column('student_id', sa.Uuid(), nullable=False),
        sa.Column('teacher_profile_id', sa.Uuid(), nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(['student_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(
            ['teacher_profile_id'], ['teacher_profiles.id'], ondelete='CASCADE'
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('student_id', 'teacher_profile_id', name='uq_chat_thread'),
    )
    op.create_index(
        op.f('ix_chat_threads_student_id'), 'chat_threads', ['student_id'], unique=False
    )
    op.create_index(
        op.f('ix_chat_threads_teacher_profile_id'), 'chat_threads', ['teacher_profile_id'],
        unique=False,
    )

    op.create_table(
        'chat_messages',
        sa.Column('thread_id', sa.Uuid(), nullable=False),
        sa.Column('sender_id', sa.Uuid(), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        *_timestamps(),
        sa.ForeignKeyConstraint(['thread_id'], ['chat_threads.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_chat_messages_thread_id'), 'chat_messages', ['thread_id'], unique=False
    )


def downgrade() -> None:
    op.drop_table('chat_messages')
    op.drop_table('chat_threads')
    op.drop_table('reservations')
    op.drop_table('swipes')
    op.drop_table('favorites')
    op.drop_table('marketplace_courses')
    op.drop_table('teacher_profiles')
