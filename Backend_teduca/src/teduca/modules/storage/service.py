"""Lógica de negocio para gestión de archivos en Supabase Storage."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from teduca.core.exceptions import ForbiddenError, NotFoundError
from teduca.core.supabase import SupabaseStorageError, build_storage_path, get_storage_client
from teduca.modules.storage.models import FileAsset
from teduca.modules.storage.repository import FileAssetRepository
from teduca.modules.storage.schemas import (
    ConfirmUploadRequest,
    FileAssetUpdate,
    FileAssetWithUrl,
    FileCategory,
    FileStatus,
    UploadUrlRequest,
    UploadUrlResponse,
    infer_file_type,
)
from teduca.modules.users.models import User

# Límites por tipo de archivo (bytes)
_SIZE_LIMITS: dict[str, int] = {
    "video": 5 * 1024 * 1024 * 1024,   # 5 GB
    "image": 20 * 1024 * 1024,          # 20 MB
    "pdf": 100 * 1024 * 1024,           # 100 MB
    "document": 50 * 1024 * 1024,       # 50 MB
    "presentation": 200 * 1024 * 1024,  # 200 MB
    "spreadsheet": 50 * 1024 * 1024,    # 50 MB
    "audio": 500 * 1024 * 1024,         # 500 MB
    "archive": 500 * 1024 * 1024,       # 500 MB
    "certificate": 10 * 1024 * 1024,    # 10 MB
    "other": 50 * 1024 * 1024,          # 50 MB
}

# Duración de URLs firmadas por categoría (segundos)
_SIGNED_URL_TTL: dict[str, int] = {
    "video": 7200,       # 2 h — streaming
    "recording": 7200,
    "certificate": 300,  # 5 min — descarga puntual
    "avatar": 86400,     # 1 día
}
_DEFAULT_TTL = 3600  # 1 h


class FileAssetService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = FileAssetRepository(session)
        self.storage = get_storage_client()

    # ── Helpers ──────────────────────────────────────────────────────────

    async def get_or_404(self, file_id: uuid.UUID) -> FileAsset:
        asset = await self.repo.get_by_id(file_id)
        if asset is None or asset.status == FileStatus.DELETED:
            raise NotFoundError("Archivo no encontrado.")
        return asset

    def _assert_owner_or_admin(self, asset: FileAsset, user: User) -> None:
        is_owner = asset.uploader_id == user.id
        is_admin = "admin" in user.role_names
        if not (is_owner or is_admin):
            raise ForbiddenError("No tienes permisos sobre este archivo.")

    def _signed_url_ttl(self, category: str) -> int:
        return _SIGNED_URL_TTL.get(category, _DEFAULT_TTL)

    # ── Subida desde servidor (UploadFile de FastAPI) ─────────────────────

    async def upload_file(
        self,
        file: UploadFile,
        bucket: str,
        category: str,
        display_name: str,
        uploader: User,
        course_id: uuid.UUID | None = None,
        lesson_id: uuid.UUID | None = None,
        access_level: str = "enrolled",
        description: str | None = None,
        extra_metadata: dict | None = None,
    ) -> FileAsset:
        content = await file.read()
        size = len(content)
        mime_type = file.content_type or "application/octet-stream"
        file_type = infer_file_type(mime_type).value

        limit = _SIZE_LIMITS.get(file_type, _SIZE_LIMITS["other"])
        if size > limit:
            raise ForbiddenError(
                f"Archivo demasiado grande. Límite para {file_type}: {limit // (1024*1024)} MB."
            )

        filename = file.filename or "file"
        path = build_storage_path(category, filename, uploader.id, course_id)

        try:
            await self.storage.upload(bucket, path, content, mime_type)
        except SupabaseStorageError as exc:
            raise ForbiddenError(f"Error al subir el archivo: {exc}") from exc

        asset = FileAsset(
            name=filename,
            display_name=display_name or filename,
            description=description,
            file_type=file_type,
            mime_type=mime_type,
            size_bytes=size,
            bucket=bucket,
            storage_path=path,
            uploader_id=uploader.id,
            course_id=course_id,
            lesson_id=lesson_id,
            category=category,
            access_level=access_level,
            extra_metadata=extra_metadata or {},
        )
        return await self.repo.add(asset)

    # ── Subida directa desde cliente (pre-signed URL) ─────────────────────

    async def create_upload_url(
        self,
        request: UploadUrlRequest,
        uploader: User,
    ) -> UploadUrlResponse:
        """Genera una URL pre-firmada para que el cliente suba directamente a Supabase."""
        file_type = infer_file_type(request.mime_type).value
        limit = _SIZE_LIMITS.get(file_type, _SIZE_LIMITS["other"])
        if request.size_bytes > limit:
            raise ForbiddenError(
                f"Archivo demasiado grande. Límite para {file_type}: {limit // (1024*1024)} MB."
            )

        path = build_storage_path(
            request.category.value,
            request.file_name,
            uploader.id,
            request.course_id,
        )
        try:
            result = await self.storage.create_signed_upload_url(request.bucket.value, path)
        except SupabaseStorageError as exc:
            raise ForbiddenError(f"Error generando URL de subida: {exc}") from exc

        return UploadUrlResponse(
            upload_url=result.get("url", ""),
            storage_path=path,
            bucket=request.bucket.value,
            token=result.get("token", ""),
        )

    async def confirm_upload(
        self,
        request: ConfirmUploadRequest,
        uploader: User,
    ) -> FileAsset:
        """Registra en BD el archivo ya subido directamente desde el cliente."""
        file_type = infer_file_type(request.mime_type).value
        asset = FileAsset(
            name=request.file_name,
            display_name=request.display_name,
            description=request.description,
            file_type=file_type,
            mime_type=request.mime_type,
            size_bytes=request.size_bytes,
            bucket=request.bucket.value,
            storage_path=request.storage_path,
            uploader_id=uploader.id,
            course_id=request.course_id,
            lesson_id=request.lesson_id,
            category=request.category.value,
            access_level=request.access_level.value,
            extra_metadata=request.extra_metadata or {},
        )
        return await self.repo.add(asset)

    # ── Obtener URL de acceso ─────────────────────────────────────────────

    async def get_file_url(self, file_id: uuid.UUID, user: User) -> FileAssetWithUrl:
        asset = await self.get_or_404(file_id)
        self._assert_access(asset, user)

        if asset.access_level == "public":
            url = await self.storage.get_public_url(asset.bucket, asset.storage_path)
            return FileAssetWithUrl(**asset.__dict__, url=url, url_expires_at=None)

        ttl = self._signed_url_ttl(asset.category)
        try:
            url, expires_at = await self.storage.create_signed_url(
                asset.bucket, asset.storage_path, ttl
            )
        except SupabaseStorageError as exc:
            raise ForbiddenError(f"Error generando URL: {exc}") from exc

        return FileAssetWithUrl(**asset.__dict__, url=url, url_expires_at=expires_at)

    def _assert_access(self, asset: FileAsset, user: User) -> None:
        """Verifica que el usuario puede acceder al archivo según access_level."""
        level = asset.access_level
        roles = set(user.role_names)

        if level == "public":
            return
        if level == "admins" and "admin" not in roles:
            raise ForbiddenError("Solo administradores pueden acceder a este archivo.")
        if level == "mentors" and not roles & {"mentor", "teacher", "admin"}:
            raise ForbiddenError("Solo mentores pueden acceder a este archivo.")
        # "enrolled" y "link" se validan en capa superior (enrollment check)

    # ── CRUD metadata ─────────────────────────────────────────────────────

    async def update(
        self, file_id: uuid.UUID, data: FileAssetUpdate, user: User
    ) -> FileAsset:
        asset = await self.get_or_404(file_id)
        self._assert_owner_or_admin(asset, user)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(asset, field, value)
        await self.session.flush()
        await self.session.refresh(asset)
        return asset

    async def delete(self, file_id: uuid.UUID, user: User) -> None:
        """Soft delete en BD + eliminación física en Storage."""
        asset = await self.get_or_404(file_id)
        self._assert_owner_or_admin(asset, user)

        try:
            await self.storage.delete(asset.bucket, [asset.storage_path])
        except SupabaseStorageError:
            pass  # continuar aunque falle en Storage para no dejar BD inconsistente

        asset.status = FileStatus.DELETED
        asset.deleted_at = datetime.now(timezone.utc)
        await self.session.flush()

    # ── Listados ──────────────────────────────────────────────────────────

    async def list_by_course(
        self,
        course_id: uuid.UUID,
        user: User,
        category: str | None = None,
        file_type: str | None = None,
    ) -> list[FileAsset]:
        roles = set(user.role_names)
        access_level = None if roles & {"admin", "teacher", "mentor"} else "enrolled"
        return await self.repo.list_by_course(course_id, category, file_type, access_level)

    async def list_my_files(
        self, user: User, bucket: str | None = None
    ) -> list[FileAsset]:
        return await self.repo.list_by_uploader(user.id, bucket)
