"""Lógica de negocio del marketplace: perfiles, descubrir, favoritos, matches,
reservas y chat (habilitado solo cuando existe un match)."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import ForbiddenError, NotFoundError
from teduca.modules.edtech.models import (
    ChatMessage,
    ChatThread,
    Favorite,
    MarketplaceCourse,
    Reservation,
    Swipe,
    TeacherProfile,
)
from teduca.modules.edtech.repository import EdtechRepository
from teduca.modules.edtech.schemas import (
    MarketplaceCourseCreate,
    MonthStat,
    ReservationCreate,
    TeacherProfileWrite,
    TeacherStats,
)
from teduca.modules.users.models import User


class EdtechService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = EdtechRepository(session)

    # --- Perfiles ---------------------------------------------------------
    async def get_or_create_my_profile(self, user: User) -> TeacherProfile:
        profile = await self.repo.get_profile_by_user(user.id)
        if profile is None:
            profile = TeacherProfile(
                user_id=user.id, languages=[], availability=[], categories=[], socials=[]
            )
            await self.repo.add(profile)
            # Re-consulta con selectinload para que `courses` quede cargado
            # (el serializado fuera del contexto async no puede lazy-loadear).
            profile = await self.get_teacher_or_404(profile.id)
        return profile

    async def get_teacher_or_404(self, profile_id: uuid.UUID) -> TeacherProfile:
        profile = await self.repo.get_profile(profile_id)
        if profile is None:
            raise NotFoundError("Perfil de profesor no encontrado.")
        return profile

    async def list_teachers(self) -> list[TeacherProfile]:
        return await self.repo.list_profiles(published_only=True)

    async def update_my_profile(
        self, user: User, data: TeacherProfileWrite, courses: list[MarketplaceCourseCreate] | None
    ) -> TeacherProfile:
        profile = await self.get_or_create_my_profile(user)
        for field, value in data.model_dump().items():
            setattr(profile, field, value)
        await self.session.flush()

        # Los cursos ofertados se reemplazan por completo si se envían.
        if courses is not None:
            await self.repo.delete_courses_for_teacher(profile.id)
            for c in courses:
                self.session.add(
                    MarketplaceCourse(teacher_profile_id=profile.id, **c.model_dump())
                )
            await self.session.flush()

        # Expira la colección para que la re-consulta traiga los cursos frescos.
        self.session.expire(profile, ["courses"])
        return await self.get_teacher_or_404(profile.id)

    # --- Cursos -----------------------------------------------------------
    async def list_courses(
        self, teacher_profile_id: uuid.UUID | None = None
    ) -> list[MarketplaceCourse]:
        return await self.repo.list_courses(teacher_profile_id=teacher_profile_id)

    async def get_course_or_404(self, course_id: uuid.UUID) -> MarketplaceCourse:
        course = await self.repo.get_course(course_id)
        if course is None:
            raise NotFoundError("Curso no encontrado.")
        return course

    # --- Descubrir --------------------------------------------------------
    async def discover_deck(self, user: User) -> list[TeacherProfile]:
        swiped = await self.repo.swiped_profile_ids(user.id)
        profiles = await self.repo.list_profiles(published_only=True)
        deck = [p for p in profiles if p.id not in swiped and p.user_id != user.id]
        # Si ya swipeó todo, se muestra el catálogo completo (menos el propio).
        if not deck:
            deck = [p for p in profiles if p.user_id != user.id]
        return deck

    async def swipe(
        self, user: User, teacher_profile_id: uuid.UUID, direction: str
    ) -> tuple[bool, TeacherProfile]:
        teacher = await self.get_teacher_or_404(teacher_profile_id)
        matched = direction == "right"

        swipe = await self.repo.get_swipe(user.id, teacher_profile_id)
        if swipe is None:
            swipe = Swipe(
                user_id=user.id,
                teacher_profile_id=teacher_profile_id,
                direction=direction,
                matched=matched,
            )
            await self.repo.add(swipe)
        else:
            swipe.direction = direction
            swipe.matched = matched
            await self.session.flush()

        if matched:
            # Un match agrega a favoritos y abre el hilo de chat.
            if await self.repo.get_favorite(user.id, teacher_profile_id) is None:
                await self.repo.add(
                    Favorite(user_id=user.id, teacher_profile_id=teacher_profile_id)
                )
            await self._ensure_thread(user.id, teacher_profile_id)

        return matched, teacher

    async def reset_deck(self, user: User) -> None:
        await self.repo.clear_swipes(user.id)

    # --- Favoritos --------------------------------------------------------
    async def list_favorites(self, user: User) -> list[TeacherProfile]:
        return await self.repo.list_favorite_profiles(user.id)

    async def is_favorite(self, user: User, teacher_profile_id: uuid.UUID) -> bool:
        return await self.repo.get_favorite(user.id, teacher_profile_id) is not None

    async def toggle_favorite(self, user: User, teacher_profile_id: uuid.UUID) -> bool:
        await self.get_teacher_or_404(teacher_profile_id)
        existing = await self.repo.get_favorite(user.id, teacher_profile_id)
        if existing is not None:
            await self.repo.delete(existing)
            return False
        await self.repo.add(Favorite(user_id=user.id, teacher_profile_id=teacher_profile_id))
        return True

    # --- Reservas ---------------------------------------------------------
    async def list_reservations(self, user: User) -> list[Reservation]:
        return await self.repo.list_reservations(user.id)

    async def create_reservation(self, user: User, data: ReservationCreate) -> Reservation:
        await self.get_teacher_or_404(data.teacher_profile_id)
        reservation = Reservation(
            user_id=user.id,
            teacher_profile_id=data.teacher_profile_id,
            marketplace_course_id=data.marketplace_course_id,
            date=data.date,
            time=data.time,
            modality=data.modality,
            price=data.price,
            currency=data.currency,
            status="pending",
        )
        await self.repo.add(reservation)
        await self.session.refresh(reservation)

        # Orbits por primera reserva (o por cada reserva confirmada).
        from teduca.modules.gamification.service import GamificationService
        from teduca.modules.gamification.models import PointsLedger
        from sqlalchemy import select as _select
        already = await self.session.scalar(
            _select(PointsLedger).where(
                PointsLedger.user_id == user.id,
                PointsLedger.event_name == "reservation.created",
            )
        )
        if already is None:
            await GamificationService(self.session).award_points(
                user.id, 25, "Primera reserva con un profesor", "reservation.created"
            )

        return reservation

    async def cancel_reservation(self, user: User, reservation_id: uuid.UUID) -> Reservation:
        reservation = await self.repo.get_reservation(reservation_id)
        if reservation is None or reservation.user_id != user.id:
            raise NotFoundError("Reserva no encontrada.")
        reservation.status = "cancelled"
        await self.session.flush()
        await self.session.refresh(reservation)
        return reservation

    # --- Chat -------------------------------------------------------------
    async def _ensure_thread(
        self, student_id: uuid.UUID, teacher_profile_id: uuid.UUID
    ) -> ChatThread:
        thread = await self.repo.get_thread_by_pair(student_id, teacher_profile_id)
        if thread is None:
            thread = ChatThread(student_id=student_id, teacher_profile_id=teacher_profile_id)
            await self.repo.add(thread)
            await self.session.refresh(thread)
        return thread

    async def list_threads(self, user: User) -> list[ChatThread]:
        return await self.repo.list_threads(user.id)

    async def open_thread(self, user: User, teacher_profile_id: uuid.UUID) -> ChatThread:
        # El chat solo se habilita si hay match (swipe a la derecha).
        if not await self.repo.has_match(user.id, teacher_profile_id):
            raise ForbiddenError("Necesitás hacer match con el profesor para chatear.")
        return await self._ensure_thread(user.id, teacher_profile_id)

    async def _thread_for_member(self, user: User, thread_id: uuid.UUID) -> ChatThread:
        thread = await self.repo.get_thread(thread_id)
        if thread is None:
            raise NotFoundError("Conversación no encontrada.")
        is_student = thread.student_id == user.id
        is_teacher = thread.teacher.user_id == user.id
        if not (is_student or is_teacher):
            raise ForbiddenError("No formás parte de esta conversación.")
        return thread

    async def list_messages(self, user: User, thread_id: uuid.UUID) -> list[ChatMessage]:
        await self._thread_for_member(user, thread_id)
        return await self.repo.list_messages(thread_id)

    # --- Stats del profesor -----------------------------------------------
    async def get_my_stats(self, user: User) -> TeacherStats:
        profile = await self.get_or_create_my_profile(user)

        # Reservaciones del perfil docente
        reservations_result = await self.session.execute(
            select(Reservation).where(Reservation.teacher_profile_id == profile.id)
        )
        reservations = list(reservations_result.scalars())
        reservations_total = len(reservations)

        # Alumnos únicos
        students_count = len({r.user_id for r in reservations})

        # Reservaciones por mes (últimos 6 meses)
        now = datetime.now(UTC)
        months: dict[str, int] = {}
        for i in range(5, -1, -1):
            # Calcular mes: retroceder i meses
            target = now.replace(day=1) - timedelta(days=1)
            for _ in range(i):
                target = target.replace(day=1) - timedelta(days=1)
            month_key = target.strftime("%Y-%m")
            months[month_key] = 0

        for r in reservations:
            # r.date es un string ISO "YYYY-MM-DD"
            month_key = r.date[:7]  # "YYYY-MM"
            if month_key in months:
                months[month_key] += 1

        reservations_by_month = [
            MonthStat(month=m, count=c) for m, c in sorted(months.items())
        ]

        return TeacherStats(
            students_count=students_count,
            reservations_total=reservations_total,
            reservations_by_month=reservations_by_month,
            rating=float(profile.rating),
            reviews_count=profile.reviews_count,
        )

    async def post_message(self, user: User, thread_id: uuid.UUID, body: str) -> ChatMessage:
        thread = await self._thread_for_member(user, thread_id)
        message = ChatMessage(thread_id=thread.id, sender_id=user.id, body=body)
        await self.repo.add(message)
        # Toca el hilo para ordenar por actividad reciente.
        thread.updated_at = message.created_at
        await self.session.flush()
        await self.session.refresh(message)
        return message
