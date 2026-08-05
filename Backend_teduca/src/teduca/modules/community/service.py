"""Capa de servicio para el módulo community."""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.community.models import Post
from teduca.modules.community.repository import PostRepository
from teduca.modules.community.schemas import PostCreate


class PostService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = PostRepository(session)

    async def create_post(self, data: PostCreate, author_id: uuid.UUID) -> Post:
        return await self.repo.create(data, author_id)

    async def list_feed(
        self,
        page: int,
        page_size: int,
        category: str,
        search: str | None,
        current_user_id: uuid.UUID,
    ) -> tuple[list[Post], int]:
        return await self.repo.list_feed(page, page_size, category, search, current_user_id)

    async def get_post(self, post_id: uuid.UUID) -> Post:
        post = await self.repo.get_by_id(post_id)
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        return post

    async def delete_post(
        self, post_id: uuid.UUID, user_id: uuid.UUID, is_admin: bool = False
    ) -> None:
        post = await self.repo.get_by_id(post_id)
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        if not is_admin and post.author_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not allowed to delete this post",
            )
        await self.repo.delete(post_id, user_id)

    async def toggle_like(self, post_id: uuid.UUID, user_id: uuid.UUID) -> dict:
        post = await self.repo.get_by_id(post_id)
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        liked = await self.repo.toggle_like(post_id, user_id)
        post = await self.repo.get_by_id(post_id)
        return {"liked": liked, "likes_count": post.likes_count}  # type: ignore[union-attr]

    async def toggle_save(self, post_id: uuid.UUID, user_id: uuid.UUID) -> dict:
        post = await self.repo.get_by_id(post_id)
        if post is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        saved = await self.repo.toggle_save(post_id, user_id)
        post = await self.repo.get_by_id(post_id)
        return {"saved": saved, "saves_count": post.saves_count}  # type: ignore[union-attr]
