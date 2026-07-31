"""Dependencias transversales de FastAPI: sesión, token, usuario actual y RBAC."""

import uuid
from collections.abc import Callable
from typing import Annotated, Any

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.config import settings
from teduca.core.database import get_db
from teduca.core.exceptions import ForbiddenError, UnauthorizedError
from teduca.core.redis import get_redis
from teduca.core.security import JWTError, decode_token
from teduca.modules.users.models import User
from teduca.modules.users.repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.api_v1_prefix}/auth/token", auto_error=False
)

DbSession = Annotated[AsyncSession, Depends(get_db)]


async def get_token_payload(
    token: Annotated[str | None, Depends(oauth2_scheme)],
) -> dict[str, Any]:
    if not token:
        raise UnauthorizedError()
    try:
        payload = decode_token(token)
    except JWTError as exc:
        raise UnauthorizedError("Token inválido o expirado.") from exc
    if payload.get("type") != "access":
        raise UnauthorizedError("Se esperaba un access token.")
    # Blacklist de access tokens revocados (logout). Redis es opcional en
    # serverless: si no está disponible, se omite la comprobación (los access
    # tokens ya expiran en minutos).
    redis = get_redis()
    if redis is not None:
        try:
            if await redis.exists(f"bl:access:{payload.get('jti')}"):
                raise UnauthorizedError("Token revocado.")
        except UnauthorizedError:
            raise
        except Exception:  # noqa: BLE001 — Redis caído: degradar sin romper el login
            pass
    return payload


async def get_current_user(
    payload: Annotated[dict[str, Any], Depends(get_token_payload)],
    session: DbSession,
) -> User:
    try:
        user_id = uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise UnauthorizedError("Token malformado.") from exc

    user = await UserRepository(session).get_by_id(user_id)
    if user is None or not user.is_active or user.deleted_at is not None:
        raise UnauthorizedError("Usuario inexistente o inactivo.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: str) -> Callable[[User], User]:
    """Dependencia RBAC: exige que el usuario tenga al menos uno de los roles."""

    def _checker(user: CurrentUser) -> User:
        if not set(roles) & set(user.role_names):
            raise ForbiddenError("No tienes el rol requerido para esta acción.")
        return user

    return _checker
