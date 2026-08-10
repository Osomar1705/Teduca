"""Schemas del módulo auth."""

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from teduca.modules.users.schemas import UserRead


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    role: str = "student"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class GoogleAuthRequest(BaseModel):
    """ID token (credential) devuelto por Google Identity Services en el front."""

    credential: str


class AuthConfig(BaseModel):
    """Configuración pública de auth para que el front decida qué mostrar."""

    google_enabled: bool
    google_client_id: str | None = None


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class AuthResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user: UserRead
    tokens: TokenPair
