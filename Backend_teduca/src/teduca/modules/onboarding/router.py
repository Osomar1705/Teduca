"""Endpoints de onboarding (/api/v1/onboarding)."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends

from teduca.core.dependencies import DbSession, get_token_payload
from teduca.modules.onboarding.schemas import (
    CheckUsernameRequest,
    OnboardingRead,
    OnboardingStatus,
    Step1Update,
    Step2Update,
    Step3Update,
    UsernameCheck,
)
from teduca.modules.onboarding.service import OnboardingService

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

TokenPayload = Annotated[dict[str, Any], Depends(get_token_payload)]


def _user_id(payload: dict[str, Any]) -> str:
    return payload["sub"]


@router.get("/status", response_model=OnboardingStatus)
async def get_status(payload: TokenPayload, session: DbSession) -> OnboardingStatus:
    """¿El usuario ya completó el onboarding?"""
    import uuid
    return await OnboardingService(session).get_status(uuid.UUID(_user_id(payload)))


@router.get("/me", response_model=OnboardingRead)
async def get_my_onboarding(payload: TokenPayload, session: DbSession) -> OnboardingRead:
    import uuid
    return await OnboardingService(session).get(uuid.UUID(_user_id(payload)))


@router.post("/check-username", response_model=UsernameCheck)
async def check_username(
    body: CheckUsernameRequest, payload: TokenPayload, session: DbSession
) -> UsernameCheck:
    import uuid
    return await OnboardingService(session).check_username(
        body.username, uuid.UUID(_user_id(payload))
    )


@router.put("/step/1", response_model=OnboardingRead)
async def save_step1(
    data: Step1Update, payload: TokenPayload, session: DbSession
) -> OnboardingRead:
    import uuid
    return await OnboardingService(session).save_step1(uuid.UUID(_user_id(payload)), data)


@router.put("/step/2", response_model=OnboardingRead)
async def save_step2(
    data: Step2Update, payload: TokenPayload, session: DbSession
) -> OnboardingRead:
    import uuid
    return await OnboardingService(session).save_step2(uuid.UUID(_user_id(payload)), data)


@router.put("/step/3", response_model=OnboardingRead)
async def save_step3(
    data: Step3Update, payload: TokenPayload, session: DbSession
) -> OnboardingRead:
    import uuid
    return await OnboardingService(session).save_step3(uuid.UUID(_user_id(payload)), data)


@router.post("/complete", response_model=OnboardingRead)
async def complete_onboarding(payload: TokenPayload, session: DbSession) -> OnboardingRead:
    import uuid
    return await OnboardingService(session).complete(uuid.UUID(_user_id(payload)))
