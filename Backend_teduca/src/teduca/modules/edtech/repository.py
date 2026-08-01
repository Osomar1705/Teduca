"""Repositorio del dominio marketplace: única capa que toca SQLAlchemy aquí."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from teduca.modules.edtech.models import (
    ChatMessage,
    ChatThread,
    Favorite,
    MarketplaceCourse,
    Reservation,
    Swipe,
    TeacherProfile,
)


class EdtechRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # --- Perfiles docentes ------------------------------------------------
    async def get_profile(self, profile_id: uuid.UUID) -> TeacherProfile | None:
        result = await self.session.execute(
            select(TeacherProfile)
            .options(selectinload(TeacherProfile.courses))
            .where(TeacherProfile.id == profile_id)
        )
        return result.scalar_one_or_none()

    async def get_profile_by_user(self, user_id: uuid.UUID) -> TeacherProfile | None:
        result = await self.session.execute(
            select(TeacherProfile)
            .options(selectinload(TeacherProfile.courses))
            .where(TeacherProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def list_profiles(self, *, published_only: bool = True) -> list[TeacherProfile]:
        query = select(TeacherProfile).options(selectinload(TeacherProfile.courses))
        if published_only:
            query = query.where(TeacherProfile.is_published.is_(True))
        result = await self.session.execute(query.order_by(TeacherProfile.created_at.desc()))
        return list(result.scalars())

    async def add(self, obj) -> object:
        self.session.add(obj)
        await self.session.flush()
        return obj

    # --- Cursos del marketplace ------------------------------------------
    async def get_course(self, course_id: uuid.UUID) -> MarketplaceCourse | None:
        return await self.session.get(MarketplaceCourse, course_id)

    async def list_courses(
        self, *, teacher_profile_id: uuid.UUID | None = None
    ) -> list[MarketplaceCourse]:
        query = select(MarketplaceCourse)
        if teacher_profile_id:
            query = query.where(MarketplaceCourse.teacher_profile_id == teacher_profile_id)
        result = await self.session.execute(query.order_by(MarketplaceCourse.created_at.desc()))
        return list(result.scalars())

    async def delete_courses_for_teacher(self, teacher_profile_id: uuid.UUID) -> None:
        for course in await self.list_courses(teacher_profile_id=teacher_profile_id):
            await self.session.delete(course)
        await self.session.flush()

    # --- Favoritos --------------------------------------------------------
    async def get_favorite(
        self, user_id: uuid.UUID, teacher_profile_id: uuid.UUID
    ) -> Favorite | None:
        result = await self.session.execute(
            select(Favorite).where(
                Favorite.user_id == user_id,
                Favorite.teacher_profile_id == teacher_profile_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_favorite_profiles(self, user_id: uuid.UUID) -> list[TeacherProfile]:
        result = await self.session.execute(
            select(TeacherProfile)
            .options(selectinload(TeacherProfile.courses))
            .join(Favorite, Favorite.teacher_profile_id == TeacherProfile.id)
            .where(Favorite.user_id == user_id)
            .order_by(Favorite.created_at.desc())
        )
        return list(result.scalars())

    async def delete(self, obj) -> None:
        await self.session.delete(obj)
        await self.session.flush()

    # --- Swipes -----------------------------------------------------------
    async def get_swipe(
        self, user_id: uuid.UUID, teacher_profile_id: uuid.UUID
    ) -> Swipe | None:
        result = await self.session.execute(
            select(Swipe).where(
                Swipe.user_id == user_id,
                Swipe.teacher_profile_id == teacher_profile_id,
            )
        )
        return result.scalar_one_or_none()

    async def swiped_profile_ids(self, user_id: uuid.UUID) -> set[uuid.UUID]:
        result = await self.session.execute(
            select(Swipe.teacher_profile_id).where(Swipe.user_id == user_id)
        )
        return set(result.scalars())

    async def clear_swipes(self, user_id: uuid.UUID) -> None:
        result = await self.session.execute(select(Swipe).where(Swipe.user_id == user_id))
        for swipe in result.scalars():
            await self.session.delete(swipe)
        await self.session.flush()

    async def has_match(self, user_id: uuid.UUID, teacher_profile_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            select(Swipe.id).where(
                Swipe.user_id == user_id,
                Swipe.teacher_profile_id == teacher_profile_id,
                Swipe.matched.is_(True),
            )
        )
        return result.scalar_one_or_none() is not None

    # --- Reservas ---------------------------------------------------------
    async def get_reservation(self, reservation_id: uuid.UUID) -> Reservation | None:
        return await self.session.get(Reservation, reservation_id)

    async def list_reservations(self, user_id: uuid.UUID) -> list[Reservation]:
        result = await self.session.execute(
            select(Reservation)
            .where(Reservation.user_id == user_id)
            .order_by(Reservation.created_at.desc())
        )
        return list(result.scalars())

    # --- Chat -------------------------------------------------------------
    async def get_thread(self, thread_id: uuid.UUID) -> ChatThread | None:
        return await self.session.get(ChatThread, thread_id)

    async def get_thread_by_pair(
        self, student_id: uuid.UUID, teacher_profile_id: uuid.UUID
    ) -> ChatThread | None:
        result = await self.session.execute(
            select(ChatThread).where(
                ChatThread.student_id == student_id,
                ChatThread.teacher_profile_id == teacher_profile_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_threads(self, student_id: uuid.UUID) -> list[ChatThread]:
        result = await self.session.execute(
            select(ChatThread)
            .where(ChatThread.student_id == student_id)
            .order_by(ChatThread.updated_at.desc())
        )
        return list(result.scalars())

    async def list_messages(self, thread_id: uuid.UUID) -> list[ChatMessage]:
        result = await self.session.execute(
            select(ChatMessage)
            .where(ChatMessage.thread_id == thread_id)
            .order_by(ChatMessage.created_at.asc())
        )
        return list(result.scalars())
