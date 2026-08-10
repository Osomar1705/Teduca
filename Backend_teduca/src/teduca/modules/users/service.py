"""Lógica de negocio de usuarios."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from teduca.core.security import hash_password
from teduca.modules.users.models import User
from teduca.modules.users.repository import RoleRepository, UserRepository
from teduca.modules.users.schemas import PublicProfileRead, TeacherProfileUpdate, UserUpdate
from teduca.modules.onboarding.models import UserOnboarding
from teduca.modules.edtech.models import TeacherProfile

# Solo "student" puede auto-asignarse. "teacher" requiere aprobación admin.
SELF_ASSIGNABLE_ROLES = {"student"}
DEFAULT_ROLE = "student"


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.users = UserRepository(session)
        self.roles = RoleRepository(session)

    async def create_user(
        self, *, email: str, name: str, password: str, role: str = DEFAULT_ROLE
    ) -> User:
        email = email.lower()
        if await self.users.get_by_email(email):
            raise ConflictError("El email ya está registrado.")

        role_name = role if role in SELF_ASSIGNABLE_ROLES else DEFAULT_ROLE
        role_obj = await self.roles.get_or_create(role_name)

        user = User(
            email=email,
            name=name,
            password_hash=hash_password(password),
            roles=[role_obj],
        )
        return await self.users.add(user)

    async def get_or_create_google_user(
        self, *, google_sub: str, email: str, name: str, avatar: str | None = None
    ) -> User:
        """Resuelve la cuenta de un usuario de Google.

        Estrategia: buscar por `google_sub`; si no existe, enlazar por email a una
        cuenta previa (marcándola como verificada); si tampoco existe, crear una
        cuenta nueva sin contraseña (auth_provider="google").
        """
        email = email.lower()
        user = await self.users.get_by_google_sub(google_sub)
        if user is not None:
            return user

        user = await self.users.get_by_email(email)
        if user is not None:
            user.google_sub = google_sub
            user.email_verified = True
            if not user.avatar and avatar:
                user.avatar = avatar
            await self.session.flush()
            return user

        role_obj = await self.roles.get_or_create(DEFAULT_ROLE)
        user = User(
            email=email,
            name=name or email.split("@")[0],
            password_hash=None,
            auth_provider="google",
            google_sub=google_sub,
            email_verified=True,
            avatar=avatar,
            roles=[role_obj],
        )
        return await self.users.add(user)

    async def get_by_id(self, user_id: uuid.UUID) -> User:
        user = await self.users.get_by_id(user_id)
        if user is None or user.deleted_at is not None:
            raise NotFoundError("Usuario no encontrado.")
        return user

    async def update_profile(self, user: User, data: UserUpdate) -> User:
        if data.name is not None:
            user.name = data.name
        if data.avatar is not None:
            user.avatar = data.avatar
        await self.session.flush()
        await self.session.refresh(user)
        return user

    # ── Gestión de roles de Profesor ───────────────────────────────────────

    async def request_teacher_role(self, user: User) -> User:
        """Marca al usuario como `teacher_pending` para evaluación."""
        current = set(user.role_names)
        if "teacher" in current:
            return user  # ya es profesor, nada que hacer
        if "teacher_pending" in current:
            return user  # ya tiene solicitud pendiente

        # Quitar rol student, poner teacher_pending
        student_role = await self.roles.get_or_create("student")
        pending_role = await self.roles.get_or_create("teacher_pending")
        if student_role in user.roles:
            user.roles.remove(student_role)
        if pending_role not in user.roles:
            user.roles.append(pending_role)

        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def approve_teacher_role(self, user_id: uuid.UUID) -> User:
        """Promueve `teacher_pending` → `teacher` (solo admins)."""
        user = await self.get_by_id(user_id)
        pending_role = await self.roles.get_or_create("teacher_pending")
        teacher_role = await self.roles.get_or_create("teacher")

        if pending_role in user.roles:
            user.roles.remove(pending_role)
        if teacher_role not in user.roles:
            user.roles.append(teacher_role)

        await self.session.flush()
        await self.session.refresh(user)

        # Notificación interna
        from teduca.modules.notifications.service import NotificationService
        await NotificationService(self.session).create(
            user.id,
            title="¡Tu cuenta de Profesor fue aprobada!",
            message="Ya puedes acceder a tu panel de profesor y publicar tu perfil.",
            type="system",
        )

        # Email de aprobación
        import os
        from teduca.core.email import send_teacher_approved_email
        front_url = os.getenv("NEXT_PUBLIC_SITE_URL", "https://teduca.vercel.app")
        send_teacher_approved_email(
            to=user.email,
            name=user.name,
            dashboard_url=f"{front_url}/teacher",
        )

        return user

    async def revoke_teacher_role(self, user_id: uuid.UUID) -> User:
        """Degrada `teacher` / `teacher_pending` → `student`."""
        user = await self.get_by_id(user_id)
        student_role = await self.roles.get_or_create("student")

        for role_name in ("teacher", "teacher_pending"):
            role_obj = await self.roles.get_or_create(role_name)
            if role_obj in user.roles:
                user.roles.remove(role_obj)

        if student_role not in user.roles:
            user.roles.append(student_role)

        await self.session.flush()
        await self.session.refresh(user)
        return user

    # ── Perfil Público ──────────────────────────────────────────────────────

    async def get_public_profile(self, username: str) -> PublicProfileRead:
        result = await self.session.execute(
            select(UserOnboarding, User)
            .join(User, User.id == UserOnboarding.user_id)
            .where(UserOnboarding.username == username.lower())
            .where(UserOnboarding.completed == True)  # noqa: E712
        )
        row = result.first()
        if row is None:
            raise NotFoundError("Perfil no encontrado.")
        onboarding, user = row
        return PublicProfileRead(
            username=onboarding.username,
            full_name=onboarding.full_name or user.name,
            avatar=user.avatar,
            institution=onboarding.institution,
            career=onboarding.career,
            academic_year=onboarding.academic_year,
            subject_tags=onboarding.subject_tags or [],
            goals=onboarding.goals or [],
        )

    # ── TeacherProfile ─────────────────────────────────────────────────────

    def _require_teacher_or_admin(self, user: User) -> None:
        if not ({"teacher", "admin"} & set(user.role_names)):
            raise ForbiddenError("Se requiere rol de profesor o administrador.")

    async def get_teacher_profile(self, user: User) -> TeacherProfile:
        """Devuelve el perfil de docente, creándolo vacío si no existe."""
        self._require_teacher_or_admin(user)
        result = await self.session.execute(
            select(TeacherProfile).where(TeacherProfile.user_id == user.id)
        )
        profile = result.scalar_one_or_none()
        if profile is None:
            profile = TeacherProfile(user_id=user.id)
            self.session.add(profile)
            await self.session.flush()
            await self.session.refresh(profile)
        return profile

    async def update_teacher_profile(
        self, user: User, data: TeacherProfileUpdate
    ) -> TeacherProfile:
        """Actualiza (o crea) el perfil de docente con los campos provistos."""
        profile = await self.get_teacher_profile(user)  # también verifica rol
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
        await self.session.flush()
        await self.session.refresh(profile)
        return profile
