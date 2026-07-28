"""Lógica de autenticación: registro, login, rotación de refresh y logout."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.config import settings
from teduca.core.exceptions import UnauthorizedError
from teduca.core.redis import get_redis
from teduca.core.security import (
    JWTError,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from teduca.modules.auth.schemas import AuthResponse, TokenPair
from teduca.modules.users.models import RefreshToken, User
from teduca.modules.users.repository import RefreshTokenRepository, UserRepository
from teduca.modules.users.service import UserService


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.users = UserRepository(session)
        self.refresh_tokens = RefreshTokenRepository(session)
        self.user_service = UserService(session)

    async def _issue_tokens(self, user: User) -> TokenPair:
        roles = user.role_names
        access, _ = create_access_token(str(user.id), roles=roles)
        refresh, jti = create_refresh_token(str(user.id))
        await self.refresh_tokens.add(
            RefreshToken(
                jti=jti,
                user_id=user.id,
                expires_at=datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days),
            )
        )
        return TokenPair(access_token=access, refresh_token=refresh)

    async def register(self, *, email: str, name: str, password: str, role: str) -> AuthResponse:
        user = await self.user_service.create_user(
            email=email, name=name, password=password, role=role
        )
        tokens = await self._issue_tokens(user)
        return AuthResponse(user=user, tokens=tokens)

    async def login(self, *, email: str, password: str) -> AuthResponse:
        user = await self.users.get_by_email(email)
        if user is None or not verify_password(password, user.password_hash):
            raise UnauthorizedError("Credenciales inválidas.")
        if not user.is_active:
            raise UnauthorizedError("Cuenta desactivada.")
        tokens = await self._issue_tokens(user)
        return AuthResponse(user=user, tokens=tokens)

    async def refresh(self, refresh_token: str) -> TokenPair:
        try:
            payload = decode_token(refresh_token)
        except JWTError as exc:
            raise UnauthorizedError("Refresh token inválido o expirado.") from exc
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Se esperaba un refresh token.")

        stored = await self.refresh_tokens.get_by_jti(payload["jti"])
        if stored is None or not stored.is_active:
            raise UnauthorizedError("Refresh token revocado.")

        # Rotación: se revoca el usado y se emite uno nuevo.
        await self.refresh_tokens.revoke(stored)
        user = await self.users.get_by_id(uuid.UUID(payload["sub"]))
        if user is None or not user.is_active:
            raise UnauthorizedError("Usuario inexistente o inactivo.")
        return await self._issue_tokens(user)

    async def logout(self, *, access_payload: dict, refresh_token: str | None) -> None:
        # Blacklist del access token vigente hasta su expiración.
        redis = get_redis()
        exp = access_payload.get("exp", 0)
        ttl = max(int(exp - datetime.now(UTC).timestamp()), 1)
        await redis.set(f"bl:access:{access_payload['jti']}", "1", ex=ttl)

        # Revoca el refresh token si se envía.
        if refresh_token:
            try:
                payload = decode_token(refresh_token)
                stored = await self.refresh_tokens.get_by_jti(payload["jti"])
                if stored and stored.is_active:
                    await self.refresh_tokens.revoke(stored)
            except JWTError:
                pass
