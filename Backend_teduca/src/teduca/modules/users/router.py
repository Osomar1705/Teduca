"""Endpoints del módulo users."""

import uuid

from fastapi import APIRouter, Depends, status

from teduca.core.dependencies import CurrentUser, DbSession, require_role
from teduca.modules.users.schemas import UserRead, UserUpdate
from teduca.modules.users.service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def read_me(current_user: CurrentUser) -> UserRead:
    return current_user


@router.patch("/me", response_model=UserRead)
async def update_me(data: UserUpdate, current_user: CurrentUser, session: DbSession) -> UserRead:
    return await UserService(session).update_profile(current_user, data)


@router.get(
    "/{user_id}",
    response_model=UserRead,
    dependencies=[Depends(require_role("admin"))],
    status_code=status.HTTP_200_OK,
)
async def get_user(user_id: uuid.UUID, session: DbSession) -> UserRead:
    return await UserService(session).get_by_id(user_id)
