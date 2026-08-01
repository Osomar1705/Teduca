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
