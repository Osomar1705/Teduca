"""Primitivas de seguridad: hashing Argon2 y emisión/verificación de JWT."""

import json
import urllib.error
import urllib.request
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any, Literal

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import JWTError, jwt

from teduca.core.config import settings

_hasher = PasswordHasher()

TokenType = Literal["access", "refresh"]

# Endpoint oficial de Google para validar un ID token (JWT firmado por Google).
_GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token="
_GOOGLE_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}


class GoogleAuthError(Exception):
    """El ID token de Google es inválido, expiró o no coincide con el client_id."""


def verify_google_id_token(id_token: str, *, client_id: str) -> dict[str, Any]:
    """Valida un ID token de Google y devuelve sus claims (email, name, sub, ...).

    Usa el endpoint `tokeninfo` de Google (verifica firma y expiración) para no
    depender de librerías extra. Comprueba además `aud` (nuestro client_id) e
    `iss`. Lanza GoogleAuthError si algo no cuadra.
    """
    try:
        with urllib.request.urlopen(_GOOGLE_TOKENINFO_URL + id_token, timeout=10) as resp:
            claims: dict[str, Any] = json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        raise GoogleAuthError("Token de Google inválido o expirado.") from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise GoogleAuthError("No se pudo verificar el token con Google.") from exc

    if claims.get("aud") != client_id:
        raise GoogleAuthError("El token no fue emitido para esta aplicación.")
    if claims.get("iss") not in _GOOGLE_ISSUERS:
        raise GoogleAuthError("Emisor del token no confiable.")
    if not claims.get("email"):
        raise GoogleAuthError("El token de Google no incluye email.")
    return claims


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
    "GoogleAuthError",
    "JWTError",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "hash_password",
    "needs_rehash",
    "verify_google_id_token",
    "verify_password",
]
