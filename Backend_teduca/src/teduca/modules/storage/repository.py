"""Repository para FileAsset."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.modules.storage.models import FileAsset


class FileAssetRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, file_id: uuid.UUID) -> FileAsset | None:
        return await self.session.get(FileAsset, file_id)

    async def get_by_storage_path(self, bucket: str, path: str) -> FileAsset | None:
        result = await self.session.execute(
            select(FileAsset).where(
                FileAsset.bucket == bucket,
                FileAsset.storage_path == path,
                FileAsset.status != "deleted",
            )
        )
        return result.scalar_one_or_none()

    async def list_by_course(
        self,
        course_id: uuid.UUID,
        category: str | None = None,
        file_type: str | None = None,
        access_level: str | None = None,
    ) -> list[FileAsset]:
        q = select(FileAsset).where(
            FileAsset.course_id == course_id,
            FileAsset.status == "active",
        )
        if category:
            q = q.where(FileAsset.category == category)
        if file_type:
            q = q.where(FileAsset.file_type == file_type)
        if access_level:
            q = q.where(FileAsset.access_level == access_level)
        q = q.order_by(FileAsset.created_at.desc())
        result = await self.session.execute(q)
        return list(result.scalars().all())

    async def list_by_uploader(
        self,
        uploader_id: uuid.UUID,
        bucket: str | None = None,
    ) -> list[FileAsset]:
        q = select(FileAsset).where(
            FileAsset.uploader_id == uploader_id,
            FileAsset.status == "active",
        )
        if bucket:
            q = q.where(FileAsset.bucket == bucket)
        q = q.order_by(FileAsset.created_at.desc())
        result = await self.session.execute(q)
        return list(result.scalars().all())

    async def list_public(
        self,
        bucket: str | None = None,
        category: str | None = None,
    ) -> list[FileAsset]:
        q = select(FileAsset).where(
            FileAsset.access_level == "public",
            FileAsset.status == "active",
        )
        if bucket:
            q = q.where(FileAsset.bucket == bucket)
        if category:
            q = q.where(FileAsset.category == category)
        q = q.order_by(FileAsset.created_at.desc())
        result = await self.session.execute(q)
        return list(result.scalars().all())

    async def add(self, asset: FileAsset) -> FileAsset:
        self.session.add(asset)
        await self.session.flush()
        await self.session.refresh(asset)
        return asset

    async def delete(self, asset: FileAsset) -> None:
        await self.session.delete(asset)
        await self.session.flush()
