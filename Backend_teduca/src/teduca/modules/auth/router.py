"""Endpoints de autenticación (/api/v1/auth)."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from teduca.core.config import settings
from teduca.core.dependencies import DbSession, get_token_payload
from teduca.modules.auth.schemas import (
    AuthConfig,
    AuthResponse,
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
)
from teduca.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/config", response_model=AuthConfig)
async def auth_config() -> AuthConfig:
    """Indica al front si debe mostrar el botón de Google (y con qué client_id)."""
    return AuthConfig(
        google_enabled=settings.google_enabled,
        google_client_id=settings.google_client_id if settings.google_enabled else None,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, session: DbSession) -> AuthResponse:
    return await AuthService(session).register(
        email=data.email, name=data.name, password=data.password, role=data.role
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, session: DbSession) -> AuthResponse:
    return await AuthService(session).login(email=data.email, password=data.password)


@router.post("/google", response_model=AuthResponse)
async def google_login(data: GoogleAuthRequest, session: DbSession) -> AuthResponse:
    """Login/registro con Google. Solo funciona si ENABLE_GOOGLE_AUTH y hay client_id."""
    return await AuthService(session).google_login(data.credential)


@router.post("/token", response_model=TokenPair, include_in_schema=False)
async def login_oauth2(
    form: Annotated[OAuth2PasswordRequestForm, Depends()], session: DbSession
) -> TokenPair:
    """Compatibilidad OAuth2 password flow (usado por el botón Authorize de /docs)."""
    result = await AuthService(session).login(email=form.username, password=form.password)
    return result.tokens


@router.post("/refresh", response_model=TokenPair)
async def refresh(data: RefreshRequest, session: DbSession) -> TokenPair:
    return await AuthService(session).refresh(data.refresh_token)


@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
async def forgot_password(data: ForgotPasswordRequest, session: DbSession) -> None:
    """Solicita un enlace de restablecimiento. Siempre responde 204 (no revela si el email existe)."""
    await AuthService(session).forgot_password(email=data.email)


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(data: ResetPasswordRequest, session: DbSession) -> None:
    """Aplica la nueva contraseña usando el token de un solo uso."""
    await AuthService(session).reset_password(token=data.token, new_password=data.new_password)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    payload: Annotated[dict[str, Any], Depends(get_token_payload)],
    session: DbSession,
    data: RefreshRequest | None = None,
) -> None:
    await AuthService(session).logout(
        access_payload=payload,
        refresh_token=data.refresh_token if data else None,
    )
