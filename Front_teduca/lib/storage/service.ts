/**
 * Servicio de archivos TEDUCA.
 * Cubre dos flujos:
 *   1. Subida desde servidor: el archivo pasa por el backend (archivos pequeños).
 *   2. Subida directa: el cliente sube a Supabase Storage con URL pre-firmada
 *      y confirma al backend (recomendado para videos y archivos grandes).
 */

import { API_BASE_URL } from "@/lib/api-client";
import { getAccessToken } from "@/lib/auth-tokens";
import type {
  AccessLevel,
  ConfirmUploadRequest,
  FileAsset,
  FileAssetUpdate,
  FileAssetWithUrl,
  FileCategory,
  StorageBucket,
  UploadUrlRequest,
  UploadUrlResponse,
} from "./types";
import { defaultBucketForCategory } from "./types";

const BASE = `${API_BASE_URL}/api/v1`;

function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`[${res.status}] ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Archivos de un curso ───────────────────────────────────────────────────

export async function getCourseFiles(
  courseId: string,
  params?: { category?: string; file_type?: string }
): Promise<FileAsset[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.file_type) qs.set("file_type", params.file_type);
  const res = await fetch(
    `${BASE}/courses/${courseId}/files?${qs}`,
    { headers: authHeaders() }
  );
  return handleResponse<FileAsset[]>(res);
}

// ── Mis archivos ───────────────────────────────────────────────────────────

export async function getMyFiles(bucket?: StorageBucket): Promise<FileAsset[]> {
  const qs = bucket ? `?bucket=${bucket}` : "";
  const res = await fetch(`${BASE}/files/mine${qs}`, {
    headers: authHeaders(),
  });
  return handleResponse<FileAsset[]>(res);
}

// ── Obtener URL de acceso ──────────────────────────────────────────────────

export async function getFileUrl(fileId: string): Promise<FileAssetWithUrl> {
  const res = await fetch(`${BASE}/files/${fileId}/url`, {
    headers: authHeaders(),
  });
  return handleResponse<FileAssetWithUrl>(res);
}

// ── Actualizar metadatos ───────────────────────────────────────────────────

export async function updateFile(
  fileId: string,
  data: FileAssetUpdate
): Promise<FileAsset> {
  const res = await fetch(`${BASE}/files/${fileId}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<FileAsset>(res);
}

// ── Eliminar archivo ───────────────────────────────────────────────────────

export async function deleteFile(fileId: string): Promise<void> {
  const res = await fetch(`${BASE}/files/${fileId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`[${res.status}] Error al eliminar archivo`);
}

// ── Flujo 1: Subida pasando por servidor (archivos pequeños / desde cursos) ──

export async function uploadCourseFile(
  courseId: string,
  file: File,
  options: {
    display_name?: string;
    category?: FileCategory;
    access_level?: AccessLevel;
    description?: string;
  } = {}
): Promise<FileAsset> {
  const qs = new URLSearchParams({
    display_name: options.display_name ?? file.name,
    category: options.category ?? "material",
    access_level: options.access_level ?? "enrolled",
  });
  if (options.description) qs.set("description", options.description);

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(
    `${BASE}/courses/${courseId}/files/upload?${qs}`,
    { method: "POST", headers: authHeaders(), body: form }
  );
  return handleResponse<FileAsset>(res);
}

// ── Flujo 2: Subida directa (videos y archivos grandes) ───────────────────

export async function requestUploadUrl(
  request: UploadUrlRequest
): Promise<UploadUrlResponse> {
  const res = await fetch(`${BASE}/files/upload-url`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<UploadUrlResponse>(res);
}

export async function uploadToSupabaseDirect(
  uploadUrl: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export async function confirmUpload(
  request: ConfirmUploadRequest
): Promise<FileAsset> {
  const res = await fetch(`${BASE}/files/confirm-upload`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<FileAsset>(res);
}

/**
 * Upload de alto nivel para archivos grandes (videos, grabaciones).
 * Solicita URL → sube directamente a Supabase → confirma en backend.
 */
export async function uploadLargeFile(
  file: File,
  options: {
    category: FileCategory;
    display_name?: string;
    description?: string;
    course_id?: string;
    lesson_id?: string;
    access_level?: AccessLevel;
    extra_metadata?: Record<string, unknown>;
    onProgress?: (pct: number) => void;
  }
): Promise<FileAsset> {
  const bucket = defaultBucketForCategory(options.category);

  const urlRes = await requestUploadUrl({
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    bucket,
    category: options.category,
    course_id: options.course_id,
    lesson_id: options.lesson_id,
    access_level: options.access_level ?? "enrolled",
  });

  await uploadToSupabaseDirect(urlRes.upload_url, file, options.onProgress);

  return confirmUpload({
    token: urlRes.token,
    storage_path: urlRes.storage_path,
    bucket,
    display_name: options.display_name ?? file.name,
    description: options.description,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    course_id: options.course_id,
    lesson_id: options.lesson_id,
    category: options.category,
    access_level: options.access_level ?? "enrolled",
    extra_metadata: options.extra_metadata,
  });
}
