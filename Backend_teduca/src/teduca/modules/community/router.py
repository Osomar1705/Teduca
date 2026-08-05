"""Endpoints del módulo community."""

import uuid

from fastapi import APIRouter, Query, status

from teduca.core.dependencies import CurrentUser, DbSession
from teduca.modules.community.schemas import PostCreate, PostFeed, PostRead
from teduca.modules.community.service import PostService

router = APIRouter(prefix="/community/posts", tags=["community"])


@router.get("", response_model=PostFeed)
async def list_feed(
    current_user: CurrentUser,
    session: DbSession,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    category: str = Query(default="todo"),
    search: str | None = Query(default=None),
) -> PostFeed:
    posts, total = await PostService(session).list_feed(
        page=page,
        page_size=page_size,
        category=category,
        search=search,
        current_user_id=current_user.id,
    )
    items = []
    for post in posts:
        data = PostRead.model_validate(post)
        data.liked_by_me = getattr(post, "liked_by_me", False)
        data.saved_by_me = getattr(post, "saved_by_me", False)
        items.append(data)
    return PostFeed(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=PostRead, status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: PostCreate,
    current_user: CurrentUser,
    session: DbSession,
) -> PostRead:
    post = await PostService(session).create_post(payload, current_user.id)
    return PostRead.model_validate(post)


@router.get("/{post_id}", response_model=PostRead)
async def get_post(
    post_id: uuid.UUID,
    current_user: CurrentUser,
    session: DbSession,
) -> PostRead:
    post = await PostService(session).get_post(post_id)
    return PostRead.model_validate(post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: uuid.UUID,
    current_user: CurrentUser,
    session: DbSession,
) -> None:
    is_admin = "admin" in current_user.role_names
    await PostService(session).delete_post(post_id, current_user.id, is_admin=is_admin)


@router.post("/{post_id}/like")
async def toggle_like(
    post_id: uuid.UUID,
    current_user: CurrentUser,
    session: DbSession,
) -> dict:
    return await PostService(session).toggle_like(post_id, current_user.id)


@router.post("/{post_id}/save")
async def toggle_save(
    post_id: uuid.UUID,
    current_user: CurrentUser,
    session: DbSession,
) -> dict:
    return await PostService(session).toggle_save(post_id, current_user.id)
