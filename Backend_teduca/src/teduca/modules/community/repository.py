"""Repositorio de acceso a datos para el módulo community."""

import uuid

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.community.models import Post, PostLike, PostSave
from teduca.modules.community.schemas import PostCreate


class PostRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create(self, data: PostCreate, author_id: uuid.UUID) -> Post:
        post = Post(
            author_id=author_id,
            content=data.content,
            category=data.category,
            title=data.title,
            location=data.location,
            deadline=data.deadline,
            link=data.link,
            tags=data.tags,
            image_urls=data.image_urls,
        )
        self.session.add(post)
        await self.session.flush()
        await self.session.refresh(post)
        return post

    async def list_feed(
        self,
        page: int,
        page_size: int,
        category: str,
        search: str | None,
        current_user_id: uuid.UUID,
    ) -> tuple[list[Post], int]:
        offset = (page - 1) * page_size

        stmt = select(Post)
        count_stmt = select(func.count()).select_from(Post)

        if category != "todo":
            stmt = stmt.where(Post.category == category)
            count_stmt = count_stmt.where(Post.category == category)

        if search:
            pattern = f"%{search}%"
            stmt = stmt.where(Post.content.ilike(pattern) | Post.title.ilike(pattern))
            count_stmt = count_stmt.where(
                Post.content.ilike(pattern) | Post.title.ilike(pattern)
            )

        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one()

        stmt = stmt.order_by(Post.created_at.desc()).offset(offset).limit(page_size)
        result = await self.session.execute(stmt)
        posts = list(result.scalars().all())

        if posts:
            post_ids = [p.id for p in posts]

            like_result = await self.session.execute(
                select(PostLike.post_id).where(
                    PostLike.post_id.in_(post_ids),
                    PostLike.user_id == current_user_id,
                )
            )
            liked_ids = set(like_result.scalars().all())

            save_result = await self.session.execute(
                select(PostSave.post_id).where(
                    PostSave.post_id.in_(post_ids),
                    PostSave.user_id == current_user_id,
                )
            )
            saved_ids = set(save_result.scalars().all())

            for post in posts:
                post.liked_by_me = post.id in liked_ids  # type: ignore[attr-defined]
                post.saved_by_me = post.id in saved_ids  # type: ignore[attr-defined]

        return posts, total

    async def get_by_id(self, post_id: uuid.UUID) -> Post | None:
        result = await self.session.execute(select(Post).where(Post.id == post_id))
        return result.scalar_one_or_none()

    async def delete(self, post_id: uuid.UUID, user_id: uuid.UUID) -> None:
        post = await self.get_by_id(post_id)
        if post is None:
            return
        await self.session.delete(post)

    async def toggle_like(self, post_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            select(PostLike).where(
                PostLike.post_id == post_id, PostLike.user_id == user_id
            )
        )
        existing = result.scalar_one_or_none()

        post = await self.get_by_id(post_id)
        if post is None:
            return False

        if existing:
            await self.session.execute(
                delete(PostLike).where(
                    PostLike.post_id == post_id, PostLike.user_id == user_id
                )
            )
            post.likes_count = max(0, post.likes_count - 1)
            return False
        else:
            self.session.add(PostLike(post_id=post_id, user_id=user_id))
            post.likes_count += 1
            return True

    async def toggle_save(self, post_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            select(PostSave).where(
                PostSave.post_id == post_id, PostSave.user_id == user_id
            )
        )
        existing = result.scalar_one_or_none()

        post = await self.get_by_id(post_id)
        if post is None:
            return False

        if existing:
            await self.session.execute(
                delete(PostSave).where(
                    PostSave.post_id == post_id, PostSave.user_id == user_id
                )
            )
            post.saves_count = max(0, post.saves_count - 1)
            return False
        else:
            self.session.add(PostSave(post_id=post_id, user_id=user_id))
            post.saves_count += 1
            return True
