"""Endpoints del módulo de materiales académicos."""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.database import get_db
from teduca.core.dependencies import CurrentUser, require_role
from teduca.core.exceptions import ForbiddenError, NotFoundError
from teduca.modules.edtech.models import Reservation, TeacherProfile
from teduca.modules.materials.models import CourseMaterial
from teduca.modules.materials.schemas import (
    CourseMaterialCreate,
    CourseMaterialRead,
    CourseMaterialUpdate,
)
from teduca.modules.users.models import User

router = APIRouter(prefix="/materials", tags=["materials"])

TeacherUser = Annotated[User, Depends(require_role("teacher"))]


async def _get_teacher_profile(teacher: User, session: AsyncSession) -> TeacherProfile:
    profile = await session.scalar(
        select(TeacherProfile).where(TeacherProfile.user_id == teacher.id)
    )
    if profile is None:
        raise NotFoundError("Perfil de profesor no encontrado.")
    return profile


async def _get_material_or_404(material_id: uuid.UUID, session: AsyncSession) -> CourseMaterial:
    m = await session.get(CourseMaterial, material_id)
    if m is None:
        raise NotFoundError("Material no encontrado.")
    return m


def _can_student_access_course(
    current_user: User, teacher_profile_id: uuid.UUID, reservations: list
) -> bool:
    """El alumno puede acceder si tiene una reserva confirmada/pendiente para este profesor."""
    return any(r.teacher_profile_id == teacher_profile_id for r in reservations)


@router.post("", response_model=CourseMaterialRead, status_code=status.HTTP_201_CREATED)
async def create_material(
    data: CourseMaterialCreate,
    teacher: TeacherUser,
    session: AsyncSession = Depends(get_db),
) -> CourseMaterialRead:
    """El profesor crea un material para uno de sus cursos."""
    profile = await _get_teacher_profile(teacher, session)

    if data.marketplace_course_id is not None:
        from teduca.modules.edtech.models import MarketplaceCourse

        course = await session.get(MarketplaceCourse, data.marketplace_course_id)
        if course is None or course.teacher_profile_id != profile.id:
            raise ForbiddenError("El curso no pertenece a tu perfil.")

    material = CourseMaterial(
        teacher_profile_id=profile.id,
        marketplace_course_id=data.marketplace_course_id,
        title=data.title,
        description=data.description,
        material_type=data.material_type,
        url=data.url,
        sort_order=data.sort_order,
    )
    session.add(material)
    await session.flush()
    await session.refresh(material)
    await session.commit()
    return CourseMaterialRead.model_validate(material)


@router.get("/teacher/me", response_model=list[CourseMaterialRead])
async def list_my_materials(
    teacher: TeacherUser,
    session: AsyncSession = Depends(get_db),
    course_id: uuid.UUID | None = None,
) -> list[CourseMaterialRead]:
    """Lista todos los materiales del profesor (opcionalmente filtrados por curso)."""
    profile = await _get_teacher_profile(teacher, session)
    q = select(CourseMaterial).where(CourseMaterial.teacher_profile_id == profile.id)
    if course_id is not None:
        q = q.where(CourseMaterial.marketplace_course_id == course_id)
    result = await session.execute(q.order_by(CourseMaterial.sort_order, CourseMaterial.created_at))
    materials = list(result.scalars())
    return [CourseMaterialRead.model_validate(m) for m in materials]


@router.get("/course/{course_id}", response_model=list[CourseMaterialRead])
async def list_course_materials(
    course_id: uuid.UUID,
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db),
) -> list[CourseMaterialRead]:
    """Lista los materiales de un curso.

    Acceso permitido a:
    - El profesor dueño del curso.
    - Estudiantes con reserva activa (pending/confirmed) para ese profesor.
    - Administradores.
    """
    from teduca.modules.edtech.models import MarketplaceCourse

    course = await session.get(MarketplaceCourse, course_id)
    if course is None:
        raise NotFoundError("Curso no encontrado.")

    is_admin = "admin" in current_user.role_names
    is_teacher = "teacher" in current_user.role_names

    if not is_admin:
        if is_teacher:
            # Solo el profesor dueño
            profile = await session.scalar(
                select(TeacherProfile).where(TeacherProfile.user_id == current_user.id)
            )
            if profile is None or profile.id != course.teacher_profile_id:
                raise ForbiddenError("No tienes acceso a los materiales de este curso.")
        else:
            # Estudiante: necesita reserva activa con el profesor
            reservations = list(
                (
                    await session.execute(
                        select(Reservation).where(
                            Reservation.user_id == current_user.id,
                            Reservation.teacher_profile_id == course.teacher_profile_id,
                            Reservation.marketplace_course_id == course_id,
                            Reservation.status.in_(["pending", "confirmed"]),
                        )
                    )
                ).scalars()
            )
            if not reservations:
                raise ForbiddenError("Debes tener una reserva activa para acceder a los materiales.")

    result = await session.execute(
        select(CourseMaterial)
        .where(CourseMaterial.marketplace_course_id == course_id)
        .order_by(CourseMaterial.sort_order, CourseMaterial.created_at)
    )
    return [CourseMaterialRead.model_validate(m) for m in result.scalars()]


@router.put("/{material_id}", response_model=CourseMaterialRead)
async def update_material(
    material_id: uuid.UUID,
    data: CourseMaterialUpdate,
    teacher: TeacherUser,
    session: AsyncSession = Depends(get_db),
) -> CourseMaterialRead:
    """El profesor edita su propio material."""
    profile = await _get_teacher_profile(teacher, session)
    material = await _get_material_or_404(material_id, session)

    if material.teacher_profile_id != profile.id:
        raise ForbiddenError("Solo puedes editar tus propios materiales.")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(material, field, value)
    await session.flush()
    await session.refresh(material)
    await session.commit()
    return CourseMaterialRead.model_validate(material)


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: uuid.UUID,
    teacher: TeacherUser,
    session: AsyncSession = Depends(get_db),
) -> None:
    """El profesor elimina su propio material."""
    profile = await _get_teacher_profile(teacher, session)
    material = await _get_material_or_404(material_id, session)

    if material.teacher_profile_id != profile.id:
        raise ForbiddenError("Solo puedes eliminar tus propios materiales.")

    await session.delete(material)
    await session.commit()
