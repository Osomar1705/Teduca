"""Endpoints de gestión de archivos."""

import uuid

from fastapi import APIRouter, Depends, Query, UploadFile, status

from teduca.core.dependencies import CurrentUser, DbSession, require_role
from teduca.modules.storage.schemas import (
    ConfirmUploadRequest,
    FileAssetRead,
    FileAssetUpdate,
    FileAssetWithUrl,
    StorageBucket,
    UploadUrlRequest,
    UploadUrlResponse,
)
from teduca.modules.storage.service import FileAssetService

TeacherOrAdminDep = Depends(require_role("teacher", "admin", "mentor"))

# Archivos de un curso
course_files_router = APIRouter(
    prefix="/courses/{course_id}/files", tags=["storage"]
)

# Archivos propios y globales
files_router = APIRouter(prefix="/files", tags=["storage"])


# ── Archivos de un curso ───────────────────────────────────────────────────

@course_files_router.get("", response_model=list[FileAssetRead])
async def list_course_files(
    course_id: uuid.UUID,
    current_user: CurrentUser,
    session: DbSession,
    category: str | None = Query(default=None),
    file_type: str | None = Query(default=None),
) -> list[FileAssetRead]:
    return await FileAssetService(session).list_by_course(
        course_id, current_user, category, file_type
    )


@course_files_router.post(
    "/upload",
    response_model=FileAssetRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[TeacherOrAdminDep],
)
async def upload_course_file(
    course_id: uuid.UUID,
    file: UploadFile,
    current_user: CurrentUser,
    session: DbSession,
    display_name: str = Query(default=""),
    category: str = Query(default="material"),
    access_level: str = Query(default="enrolled"),
    description: str | None = Query(default=None),
) -> FileAssetRead:
    from teduca.modules.storage.schemas import FileCategory, StorageBucket

    bucket_map = {
        "video": StorageBucket.COURSE_VIDEOS,
        "recording": StorageBucket.MENTOR_RECORDINGS,
        "thumbnail": StorageBucket.THUMBNAILS,
        "certificate": StorageBucket.CERTIFICATES,
        "assignment": StorageBucket.ASSIGNMENTS,
        "resource": StorageBucket.RESOURCES,
    }
    bucket = bucket_map.get(category, StorageBucket.COURSE_MATERIALS).value

    return await FileAssetService(session).upload_file(
        file=file,
        bucket=bucket,
        category=category,
        display_name=display_name or (file.filename or ""),
        uploader=current_user,
        course_id=course_id,
        access_level=access_level,
        description=description,
    )


# ── Subida pre-firmada (cliente sube directamente) ────────────────────────

@files_router.post(
    "/upload-url",
    response_model=UploadUrlResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[TeacherOrAdminDep],
)
async def request_upload_url(
    request: UploadUrlRequest,
    current_user: CurrentUser,
    session: DbSession,
) -> UploadUrlResponse:
    return await FileAssetService(session).create_upload_url(request, current_user)


@files_router.post(
    "/confirm-upload",
    response_model=FileAssetRead,
    status_code=status.HTTP_201_CREATED,
)
async def confirm_upload(
    request: ConfirmUploadRequest,
    current_user: CurrentUser,
    session: DbSession,
) -> FileAssetRead:
    return await FileAssetService(session).confirm_upload(request, current_user)


# ── Mis archivos ───────────────────────────────────────────────────────────

@files_router.get("/mine", response_model=list[FileAssetRead])
async def list_my_files(
    current_user: CurrentUser,
    session: DbSession,
    bucket: str | None = Query(default=None),
) -> list[FileAssetRead]:
    return await FileAssetService(session).list_my_files(current_user, bucket)


# ── CRUD individual ────────────────────────────────────────────────────────

@files_router.get("/{file_id}", response_model=FileAssetRead)
async def get_file(
    file_id: uuid.UUID,
    session: DbSession,
    current_user: CurrentUser,
) -> FileAssetRead:
    return await FileAssetService(session).get_or_404(file_id)


@files_router.get("/{file_id}/url", response_model=FileAssetWithUrl)
async def get_file_url(
    file_id: uuid.UUID,
    current_user: CurrentUser,
    session: DbSession,
) -> FileAssetWithUrl:
    return await FileAssetService(session).get_file_url(file_id, current_user)


@files_router.patch("/{file_id}", response_model=FileAssetRead)
async def update_file(
    file_id: uuid.UUID,
    data: FileAssetUpdate,
    current_user: CurrentUser,
    session: DbSession,
) -> FileAssetRead:
    return await FileAssetService(session).update(file_id, data, current_user)


@files_router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: uuid.UUID,
    current_user: CurrentUser,
    session: DbSession,
) -> None:
    await FileAssetService(session).delete(file_id, current_user)
