"""Primitivas de seguridad: hashing Argon2 y emisión/verificación de JWT."""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any, Literal

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import JWTError, jwt

from teduca.core.config import settings

_hasher = PasswordHasher()

TokenType = Literal["access", "refresh"]


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except VerifyMismatchError:
        return False


def needs_rehash(password_hash: str) -> bool:
    return _hasher.check_needs_rehash(password_hash)


def _create_token(
    subject: str, token_type: TokenType, expires_delta: timedelta, **claims: Any
) -> tuple[str, str]:
    """Crea un JWT firmado. Devuelve (token, jti) para permitir revocación."""
    now = datetime.now(UTC)
    jti = str(uuid.uuid4())
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
        "jti": jti,
        **claims,
    }
    token = jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)
    return token, jti


def create_access_token(subject: str, **claims: Any) -> tuple[str, str]:
    return _create_token(
        subject,
        "access",
        timedelta(minutes=settings.access_token_expire_minutes),
        **claims,
    )


def create_refresh_token(subject: str, **claims: Any) -> tuple[str, str]:
    return _create_token(
        subject,
        "refresh",
        timedelta(days=settings.refresh_token_expire_days),
        **claims,
    )


def decode_token(token: str) -> dict[str, Any]:
    """Decodifica y valida firma/exp. Lanza JWTError si es inválido."""
    return jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])


__all__ = [
    "JWTError",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "hash_password",
    "needs_rehash",
    "verify_password",
]
