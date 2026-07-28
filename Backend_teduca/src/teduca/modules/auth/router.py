"""Endpoints de autenticación (/api/v1/auth)."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from teduca.core.dependencies import DbSession, get_token_payload
from teduca.modules.auth.schemas import (
    AuthResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
)
from teduca.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, session: DbSession) -> AuthResponse:
    return await AuthService(session).register(
        email=data.email, name=data.name, password=data.password, role=data.role
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, session: DbSession) -> AuthResponse:
    return await AuthService(session).login(email=data.email, password=data.password)


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
