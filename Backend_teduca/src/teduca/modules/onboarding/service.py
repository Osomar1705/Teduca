"""Servicio de onboarding."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.onboarding.repository import OnboardingRepository
from teduca.modules.onboarding.schemas import (
    OnboardingRead,
    OnboardingStatus,
    Step1Update,
    Step2Update,
    Step3Update,
    UsernameCheck,
    _is_edu_email,
)
from teduca.modules.users.repository import UserRepository


class OnboardingService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = OnboardingRepository(session)
        self.users = UserRepository(session)

    async def get_status(self, user_id: uuid.UUID) -> OnboardingStatus:
        obj = await self.repo.get_or_create(user_id)
        await self.session.commit()
        return OnboardingStatus(completed=obj.completed, current_step=obj.current_step)

    async def get(self, user_id: uuid.UUID) -> OnboardingRead:
        obj = await self.repo.get_or_create(user_id)
        await self.session.commit()
        return OnboardingRead.model_validate(obj)

    async def check_username(self, username: str, user_id: uuid.UUID) -> UsernameCheck:
        taken = await self.repo.username_taken(username, exclude_user_id=user_id)
        return UsernameCheck(available=not taken)

    async def save_step1(self, user_id: uuid.UUID, data: Step1Update) -> OnboardingRead:
        if await self.repo.username_taken(data.username, exclude_user_id=user_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El nombre de usuario ya está en uso.",
            )
        obj = await self.repo.get_or_create(user_id)

        # Detectar verificación institucional
        user = await self.users.get_by_id(user_id)
        edu_verified = _is_edu_email(user.email) if user else False

        obj.full_name = data.full_name
        obj.username = data.username
        obj.birth_date = data.birth_date
        obj.is_edu_verified = edu_verified
        obj.current_step = max(obj.current_step, 2)

        await self.session.commit()
        await self.session.refresh(obj)
        return OnboardingRead.model_validate(obj)

    async def save_step2(self, user_id: uuid.UUID, data: Step2Update) -> OnboardingRead:
        obj = await self.repo.get_or_create(user_id)
        obj.institution = data.institution
        obj.career = data.career
        obj.academic_year = data.academic_year
        obj.goals = data.goals
        obj.current_step = max(obj.current_step, 3)
        await self.session.commit()
        await self.session.refresh(obj)
        return OnboardingRead.model_validate(obj)

    async def save_step3(self, user_id: uuid.UUID, data: Step3Update) -> OnboardingRead:
        obj = await self.repo.get_or_create(user_id)
        obj.subject_tags = data.subject_tags
        obj.project_interests = data.project_interests
        obj.learning_styles = data.learning_styles
        obj.current_step = 3
        await self.session.commit()
        await self.session.refresh(obj)
        return OnboardingRead.model_validate(obj)

    async def complete(self, user_id: uuid.UUID) -> OnboardingRead:
        obj = await self.repo.get_or_create(user_id)
        if not obj.full_name or not obj.username:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Completa el paso 1 antes de finalizar.",
            )
        obj.completed = True
        await self.session.commit()
        await self.session.refresh(obj)
        return OnboardingRead.model_validate(obj)
