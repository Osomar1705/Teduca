"""Endpoints del módulo users."""

import uuid

from fastapi import APIRouter, Depends, status

from teduca.core.dependencies import CurrentUser, DbSession, require_role
from teduca.modules.users.schemas import PublicProfileRead, TeacherProfileRead, TeacherProfileUpdate, UserRead, UserUpdate
from teduca.modules.users.service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile/{username}", response_model=PublicProfileRead, summary="Perfil público por username")
async def get_public_profile(username: str, session: DbSession) -> PublicProfileRead:
    """Accesible sin autenticación. Devuelve el perfil público de un usuario por su username."""
    return await UserService(session).get_public_profile(username)


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


# ── Evaluación para ser Profesor ───────────────────────────────────────────

@router.post(
    "/me/request-teacher",
    response_model=UserRead,
    summary="Solicitar evaluación para ser Profesor",
)
async def request_teacher_evaluation(
    current_user: CurrentUser,
    session: DbSession,
) -> UserRead:
    """
    Cambia el rol del usuario a `teacher_pending`.
    El equipo TEDUCA revisará la solicitud y, si es aprobada, un admin
    promoverá la cuenta a `teacher` usando el endpoint de aprobación.
    """
    return await UserService(session).request_teacher_role(current_user)


@router.post(
    "/{user_id}/approve-teacher",
    response_model=UserRead,
    dependencies=[Depends(require_role("admin"))],
    summary="[Admin] Aprobar solicitud de Profesor",
)
async def approve_teacher(user_id: uuid.UUID, session: DbSession) -> UserRead:
    """Solo accesible para admins. Promueve `teacher_pending` → `teacher`."""
    return await UserService(session).approve_teacher_role(user_id)


@router.get(
    "/me/teacher-profile",
    response_model=TeacherProfileRead,
    summary="Obtener perfil de docente del usuario autenticado",
)
async def read_teacher_profile(
    current_user: CurrentUser,
    session: DbSession,
) -> TeacherProfileRead:
    """Devuelve el perfil de docente. Se crea vacío si no existía aún."""
    return await UserService(session).get_teacher_profile(current_user)


@router.patch(
    "/me/teacher-profile",
    response_model=TeacherProfileRead,
    summary="Actualizar perfil de docente del usuario autenticado",
)
async def update_teacher_profile(
    data: TeacherProfileUpdate,
    current_user: CurrentUser,
    session: DbSession,
) -> TeacherProfileRead:
    """Actualiza los campos provistos del perfil de docente."""
    return await UserService(session).update_teacher_profile(current_user, data)


@router.post(
    "/{user_id}/revoke-teacher",
    response_model=UserRead,
    dependencies=[Depends(require_role("admin"))],
    summary="[Admin] Revocar acceso de Profesor",
)
async def revoke_teacher(user_id: uuid.UUID, session: DbSession) -> UserRead:
    """Degrada `teacher` → `student`."""
    return await UserService(session).revoke_teacher_role(user_id)
