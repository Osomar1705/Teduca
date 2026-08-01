"""Endpoints del dominio marketplace (/api/v1/edtech)."""

import uuid

from fastapi import APIRouter, status

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.modules.edtech.schemas import (
    ChatMessageCreate,
    ChatMessageRead,
    ChatThreadRead,
    MarketplaceCourseRead,
    MyProfileUpdate,
    ReservationCreate,
    ReservationRead,
    SwipeRequest,
    SwipeResult,
    TeacherProfileRead,
)
from teduca.modules.edtech.service import EdtechService

router = APIRouter(prefix="/edtech", tags=["edtech"])


# --- Perfiles ------------------------------------------------------------
@router.get("/teachers", response_model=list[TeacherProfileRead])
async def list_teachers(session: DbSession) -> list[TeacherProfileRead]:
    profiles = await EdtechService(session).list_teachers()
    return [TeacherProfileRead.model_validate(p) for p in profiles]


@router.get("/me/profile", response_model=TeacherProfileRead)
async def get_my_profile(current_user: CurrentUser, session: DbSession) -> TeacherProfileRead:
    profile = await EdtechService(session).get_or_create_my_profile(current_user)
    return TeacherProfileRead.model_validate(profile)


@router.put("/me/profile", response_model=TeacherProfileRead)
async def update_my_profile(
    data: MyProfileUpdate, current_user: CurrentUser, session: DbSession
) -> TeacherProfileRead:
    profile_fields = data.model_dump(exclude={"courses"})
    profile = await EdtechService(session).update_my_profile(
        current_user, MyProfileUpdate(**profile_fields), data.courses
    )
    return TeacherProfileRead.model_validate(profile)


@router.get("/teachers/{teacher_id}", response_model=TeacherProfileRead)
async def get_teacher(teacher_id: uuid.UUID, session: DbSession) -> TeacherProfileRead:
    profile = await EdtechService(session).get_teacher_or_404(teacher_id)
    return TeacherProfileRead.model_validate(profile)


# --- Cursos --------------------------------------------------------------
@router.get("/courses", response_model=list[MarketplaceCourseRead])
async def list_courses(
    session: DbSession, teacher_profile_id: uuid.UUID | None = None
) -> list[MarketplaceCourseRead]:
    courses = await EdtechService(session).list_courses(teacher_profile_id)
    return [MarketplaceCourseRead.model_validate(c) for c in courses]


@router.get("/courses/{course_id}", response_model=MarketplaceCourseRead)
async def get_course(course_id: uuid.UUID, session: DbSession) -> MarketplaceCourseRead:
    course = await EdtechService(session).get_course_or_404(course_id)
    return MarketplaceCourseRead.model_validate(course)


# --- Descubrir -----------------------------------------------------------
@router.get("/discover", response_model=list[TeacherProfileRead])
async def discover(current_user: CurrentUser, session: DbSession) -> list[TeacherProfileRead]:
    deck = await EdtechService(session).discover_deck(current_user)
    return [TeacherProfileRead.model_validate(p) for p in deck]


@router.post("/discover/{teacher_id}/swipe", response_model=SwipeResult)
async def swipe(
    teacher_id: uuid.UUID,
    data: SwipeRequest,
    current_user: CurrentUser,
    session: DbSession,
) -> SwipeResult:
    matched, teacher = await EdtechService(session).swipe(
        current_user, teacher_id, data.direction
    )
    return SwipeResult(matched=matched, teacher=TeacherProfileRead.model_validate(teacher))


@router.post("/discover/reset", status_code=status.HTTP_204_NO_CONTENT)
async def reset_deck(current_user: CurrentUser, session: DbSession) -> None:
    await EdtechService(session).reset_deck(current_user)


# --- Favoritos -----------------------------------------------------------
@router.get("/favorites", response_model=list[TeacherProfileRead])
async def list_favorites(current_user: CurrentUser, session: DbSession) -> list[TeacherProfileRead]:
    profiles = await EdtechService(session).list_favorites(current_user)
    return [TeacherProfileRead.model_validate(p) for p in profiles]


@router.get("/favorites/{teacher_id}", response_model=dict)
async def is_favorite(
    teacher_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> dict:
    return {"is_favorite": await EdtechService(session).is_favorite(current_user, teacher_id)}


@router.post("/favorites/{teacher_id}/toggle", response_model=dict)
async def toggle_favorite(
    teacher_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> dict:
    return {"is_favorite": await EdtechService(session).toggle_favorite(current_user, teacher_id)}


# --- Reservas ------------------------------------------------------------
@router.get("/reservations", response_model=list[ReservationRead])
async def list_reservations(
    current_user: CurrentUser, session: DbSession
) -> list[ReservationRead]:
    items = await EdtechService(session).list_reservations(current_user)
    return [ReservationRead.model_validate(r) for r in items]


@router.post(
    "/reservations", response_model=ReservationRead, status_code=status.HTTP_201_CREATED
)
async def create_reservation(
    data: ReservationCreate, current_user: CurrentUser, session: DbSession
) -> ReservationRead:
    reservation = await EdtechService(session).create_reservation(current_user, data)
    return ReservationRead.model_validate(reservation)


@router.post("/reservations/{reservation_id}/cancel", response_model=ReservationRead)
async def cancel_reservation(
    reservation_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> ReservationRead:
    reservation = await EdtechService(session).cancel_reservation(current_user, reservation_id)
    return ReservationRead.model_validate(reservation)


# --- Chat ----------------------------------------------------------------
@router.get("/chat/threads", response_model=list[ChatThreadRead])
async def list_threads(current_user: CurrentUser, session: DbSession) -> list[ChatThreadRead]:
    threads = await EdtechService(session).list_threads(current_user)
    return [ChatThreadRead.model_validate(t) for t in threads]


@router.post(
    "/chat/threads/{teacher_id}", response_model=ChatThreadRead, status_code=status.HTTP_200_OK
)
async def open_thread(
    teacher_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> ChatThreadRead:
    thread = await EdtechService(session).open_thread(current_user, teacher_id)
    return ChatThreadRead.model_validate(thread)


@router.get("/chat/threads/{thread_id}/messages", response_model=list[ChatMessageRead])
async def list_messages(
    thread_id: uuid.UUID, current_user: CurrentUser, session: DbSession
) -> list[ChatMessageRead]:
    messages = await EdtechService(session).list_messages(current_user, thread_id)
    return [ChatMessageRead.model_validate(m) for m in messages]


@router.post(
    "/chat/threads/{thread_id}/messages",
    response_model=ChatMessageRead,
    status_code=status.HTTP_201_CREATED,
)
async def post_message(
    thread_id: uuid.UUID,
    data: ChatMessageCreate,
    current_user: CurrentUser,
    session: DbSession,
) -> ChatMessageRead:
    message = await EdtechService(session).post_message(current_user, thread_id, data.body)
    return ChatMessageRead.model_validate(message)
