"""Cliente async para Supabase Storage (REST API v1)."""

from __future__ import annotations

import mimetypes
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

from teduca.core.config import settings


class SupabaseStorageError(Exception):
    pass


class SupabaseStorageClient:
    """Thin async wrapper sobre la Storage REST API de Supabase."""

    def __init__(self) -> None:
        self._base = settings.storage_url
        self._key = settings.supabase_service_key

    @property
    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._key}",
            "apikey": self._key,
        }

    # ── Operaciones de objetos ─────────────────────────────────────────────

    async def upload(
        self,
        bucket: str,
        path: str,
        data: bytes,
        content_type: str,
        upsert: bool = False,
    ) -> dict[str, Any]:
        """Sube un archivo al bucket. Retorna la respuesta de Supabase."""
        url = f"{self._base}/object/{bucket}/{path}"
        headers = {
            **self._headers,
            "Content-Type": content_type,
            "x-upsert": "true" if upsert else "false",
        }
        async with httpx.AsyncClient() as client:
            r = await client.post(url, content=data, headers=headers, timeout=120)
        if r.status_code not in (200, 201):
            raise SupabaseStorageError(f"Upload falló [{r.status_code}]: {r.text}")
        return r.json()

    async def delete(self, bucket: str, paths: list[str]) -> None:
        """Elimina uno o varios archivos de un bucket."""
        url = f"{self._base}/object/{bucket}"
        async with httpx.AsyncClient() as client:
            r = await client.delete(
                url,
                headers=self._headers,
                json={"prefixes": paths},
                timeout=30,
            )
        if r.status_code not in (200, 204):
            raise SupabaseStorageError(f"Delete falló [{r.status_code}]: {r.text}")

    async def get_public_url(self, bucket: str, path: str) -> str:
        """URL pública (solo para buckets públicos)."""
        return f"{self._base}/object/public/{bucket}/{path}"

    async def create_signed_url(
        self,
        bucket: str,
        path: str,
        expires_in: int = 3600,
    ) -> tuple[str, datetime]:
        """URL firmada temporal. Retorna (url, expires_at)."""
        url = f"{self._base}/object/sign/{bucket}/{path}"
        async with httpx.AsyncClient() as client:
            r = await client.post(
                url,
                headers=self._headers,
                json={"expiresIn": expires_in},
                timeout=15,
            )
        if r.status_code != 200:
            raise SupabaseStorageError(f"Sign URL falló [{r.status_code}]: {r.text}")
        signed_url = r.json()["signedURL"]
        full_url = f"{settings.supabase_url}{signed_url}"
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
        return full_url, expires_at

    async def create_signed_upload_url(
        self,
        bucket: str,
        path: str,
    ) -> dict[str, Any]:
        """URL pre-firmada para subida directa desde el cliente."""
        url = f"{self._base}/object/upload/sign/{bucket}/{path}"
        async with httpx.AsyncClient() as client:
            r = await client.post(url, headers=self._headers, timeout=15)
        if r.status_code != 200:
            raise SupabaseStorageError(f"Upload sign URL falló [{r.status_code}]: {r.text}")
        data = r.json()
        # Supabase devuelve url relativa ("/object/upload/sign/...") → la completamos
        relative = data.get("url", "")
        if relative and not relative.startswith("http"):
            data["url"] = f"{settings.supabase_url}/storage/v1{relative}"
        return data

    async def move(self, bucket: str, from_path: str, to_path: str) -> None:
        """Mueve/renombra un archivo dentro del mismo bucket."""
        url = f"{self._base}/object/move"
        async with httpx.AsyncClient() as client:
            r = await client.post(
                url,
                headers=self._headers,
                json={"bucketId": bucket, "sourceKey": from_path, "destinationKey": to_path},
                timeout=15,
            )
        if r.status_code != 200:
            raise SupabaseStorageError(f"Move falló [{r.status_code}]: {r.text}")

    # ── Gestión de buckets ─────────────────────────────────────────────────

    async def create_bucket(
        self,
        bucket_id: str,
        public: bool = False,
        file_size_limit: int | None = None,
        allowed_mime_types: list[str] | None = None,
    ) -> dict[str, Any]:
        url = f"{self._base}/bucket"
        body: dict[str, Any] = {"id": bucket_id, "name": bucket_id, "public": public}
        if file_size_limit is not None:
            body["fileSizeLimit"] = file_size_limit
        if allowed_mime_types is not None:
            body["allowedMimeTypes"] = allowed_mime_types
        async with httpx.AsyncClient() as client:
            r = await client.post(url, headers=self._headers, json=body, timeout=15)
        if r.status_code not in (200, 201):
            raise SupabaseStorageError(f"Create bucket falló [{r.status_code}]: {r.text}")
        return r.json()

    async def list_buckets(self) -> list[dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{self._base}/bucket", headers=self._headers, timeout=15)
        if r.status_code != 200:
            raise SupabaseStorageError(f"List buckets falló [{r.status_code}]: {r.text}")
        return r.json()


# ── Path helpers ───────────────────────────────────────────────────────────

def build_storage_path(
    category: str,
    original_filename: str,
    owner_id: uuid.UUID | None = None,
    course_id: uuid.UUID | None = None,
) -> str:
    """Construye la ruta dentro del bucket de forma jerárquica y única."""
    parts: list[str] = []
    if course_id:
        parts.append(f"courses/{course_id}")
    elif owner_id:
        parts.append(f"users/{owner_id}")
    parts.append(category)
    unique_name = f"{uuid.uuid4()}_{original_filename}"
    parts.append(unique_name)
    return "/".join(parts)


def infer_content_type(filename: str, fallback: str = "application/octet-stream") -> str:
    ct, _ = mimetypes.guess_type(filename)
    return ct or fallback


# Singleton
_client: SupabaseStorageClient | None = None


def get_storage_client() -> SupabaseStorageClient:
    global _client
    if _client is None:
        _client = SupabaseStorageClient()
    return _client
