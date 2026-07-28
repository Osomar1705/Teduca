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


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user: UserRead
    tokens: TokenPair
