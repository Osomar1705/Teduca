"""Schemas Pydantic para FileAsset."""

import uuid
from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


# ── Enums ──────────────────────────────────────────────────────────────────

class StorageBucket(StrEnum):
    AVATARS = "avatars"
    COURSE_MATERIALS = "course-materials"
    COURSE_VIDEOS = "course-videos"
    MENTOR_RECORDINGS = "mentor-recordings"
    ASSIGNMENTS = "assignments"
    RESOURCES = "resources"
    EVENTS = "events"
    COMMUNITY = "community"
    CERTIFICATES = "certificates"
    THUMBNAILS = "thumbnails"
    ATTACHMENTS = "attachments"


class FileType(StrEnum):
    PDF = "pdf"
    VIDEO = "video"
    IMAGE = "image"
    AUDIO = "audio"
    DOCUMENT = "document"
    SPREADSHEET = "spreadsheet"
    PRESENTATION = "presentation"
    ARCHIVE = "archive"
    CERTIFICATE = "certificate"
    OTHER = "other"


class FileCategory(StrEnum):
    MATERIAL = "material"
    VIDEO = "video"
    RECORDING = "recording"
    ASSIGNMENT = "assignment"
    RESOURCE = "resource"
    CERTIFICATE = "certificate"
    THUMBNAIL = "thumbnail"
    AVATAR = "avatar"
    ATTACHMENT = "attachment"
    EXAM = "exam"
    GUIDE = "guide"
    PROJECT = "project"
    EVENT = "event"
    COMMUNITY = "community"


class AccessLevel(StrEnum):
    PUBLIC = "public"
    ENROLLED = "enrolled"
    MENTORS = "mentors"
    ADMINS = "admins"
    LINK = "link"  # enlace firmado temporal


class FileStatus(StrEnum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"


# ── Helpers ────────────────────────────────────────────────────────────────

MIME_TO_FILE_TYPE: dict[str, FileType] = {
    "application/pdf": FileType.PDF,
    "video/mp4": FileType.VIDEO,
    "video/webm": FileType.VIDEO,
    "video/quicktime": FileType.VIDEO,
    "video/x-msvideo": FileType.VIDEO,
    "video/mpeg": FileType.VIDEO,
    "image/jpeg": FileType.IMAGE,
    "image/png": FileType.IMAGE,
    "image/gif": FileType.IMAGE,
    "image/webp": FileType.IMAGE,
    "image/svg+xml": FileType.IMAGE,
    "audio/mpeg": FileType.AUDIO,
    "audio/ogg": FileType.AUDIO,
    "audio/wav": FileType.AUDIO,
    "application/msword": FileType.DOCUMENT,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileType.DOCUMENT,
    "application/vnd.ms-excel": FileType.SPREADSHEET,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileType.SPREADSHEET,
    "application/vnd.ms-powerpoint": FileType.PRESENTATION,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": FileType.PRESENTATION,
    "application/zip": FileType.ARCHIVE,
    "application/x-zip-compressed": FileType.ARCHIVE,
    "application/x-rar-compressed": FileType.ARCHIVE,
    "application/gzip": FileType.ARCHIVE,
}


def infer_file_type(mime_type: str) -> FileType:
    return MIME_TO_FILE_TYPE.get(mime_type, FileType.OTHER)


# ── Schemas de entrada ─────────────────────────────────────────────────────

class FileAssetCreate(BaseModel):
    display_name: str = Field(max_length=300)
    description: str | None = None
    course_id: uuid.UUID | None = None
    lesson_id: uuid.UUID | None = None
    bucket: StorageBucket
    category: FileCategory
    access_level: AccessLevel = AccessLevel.ENROLLED
    extra_metadata: dict[str, Any] | None = None


class FileAssetUpdate(BaseModel):
    display_name: str | None = Field(default=None, max_length=300)
    description: str | None = None
    access_level: AccessLevel | None = None
    category: FileCategory | None = None
    status: FileStatus | None = None
    extra_metadata: dict[str, Any] | None = None


# ── Schema de respuesta ────────────────────────────────────────────────────

class FileAssetRead(BaseModel):
    id: uuid.UUID
    name: str
    display_name: str
    description: str | None
    file_type: str
    mime_type: str
    size_bytes: int
    version: int
    bucket: str
    storage_path: str
    course_id: uuid.UUID | None
    lesson_id: uuid.UUID | None
    uploader_id: uuid.UUID | None
    category: str
    access_level: str
    status: str
    extra_metadata: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FileAssetWithUrl(FileAssetRead):
    """FileAsset con URL temporal para descarga/streaming."""
    url: str
    url_expires_at: datetime | None = None


# ── Upload intent (antes de subir el archivo) ─────────────────────────────

class UploadUrlRequest(BaseModel):
    """Solicitar una URL pre-firmada para subir directamente desde el cliente."""
    file_name: str
    mime_type: str
    size_bytes: int
    bucket: StorageBucket
    category: FileCategory
    course_id: uuid.UUID | None = None
    lesson_id: uuid.UUID | None = None
    access_level: AccessLevel = AccessLevel.ENROLLED


class UploadUrlResponse(BaseModel):
    upload_url: str
    storage_path: str
    bucket: str
    token: str  # para confirmar la subida después


class ConfirmUploadRequest(BaseModel):
    """Confirmar que la subida directa al cliente terminó."""
    token: str
    storage_path: str
    bucket: StorageBucket
    display_name: str
    description: str | None = None
    file_name: str
    mime_type: str
    size_bytes: int
    course_id: uuid.UUID | None = None
    lesson_id: uuid.UUID | None = None
    category: FileCategory
    access_level: AccessLevel = AccessLevel.ENROLLED
    extra_metadata: dict[str, Any] | None = None
