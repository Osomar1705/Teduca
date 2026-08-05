"""Lógica de negocio de usuarios."""

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import ConflictError, NotFoundError
from teduca.core.security import hash_password
from teduca.modules.users.models import User
from teduca.modules.users.repository import RoleRepository, UserRepository
from teduca.modules.users.schemas import UserUpdate

# Roles válidos que un usuario puede auto-asignarse al registrarse.
SELF_ASSIGNABLE_ROLES = {"student", "teacher"}
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
