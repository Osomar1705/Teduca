export type StorageBucket =
  | "avatars"
  | "course-materials"
  | "course-videos"
  | "mentor-recordings"
  | "assignments"
  | "resources"
  | "events"
  | "community"
  | "certificates"
  | "thumbnails"
  | "attachments";

export type FileType =
  | "pdf"
  | "video"
  | "image"
  | "audio"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "certificate"
  | "other";

export type FileCategory =
  | "material"
  | "video"
  | "recording"
  | "assignment"
  | "resource"
  | "certificate"
  | "thumbnail"
  | "avatar"
  | "attachment"
  | "exam"
  | "guide"
  | "project"
  | "event"
  | "community";

export type AccessLevel = "public" | "enrolled" | "mentors" | "admins" | "link";
export type FileStatus = "active" | "archived" | "deleted";

export interface FileAsset {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  file_type: FileType;
  mime_type: string;
  size_bytes: number;
  version: number;
  bucket: StorageBucket;
  storage_path: string;
  course_id: string | null;
  lesson_id: string | null;
  uploader_id: string | null;
  category: FileCategory;
  access_level: AccessLevel;
  status: FileStatus;
  extra_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface FileAssetWithUrl extends FileAsset {
  url: string;
  url_expires_at: string | null;
}

export interface UploadUrlRequest {
  file_name: string;
  mime_type: string;
  size_bytes: number;
  bucket: StorageBucket;
  category: FileCategory;
  course_id?: string;
  lesson_id?: string;
  access_level?: AccessLevel;
}

export interface UploadUrlResponse {
  upload_url: string;
  storage_path: string;
  bucket: string;
  token: string;
}

export interface ConfirmUploadRequest {
  token: string;
  storage_path: string;
  bucket: StorageBucket;
  display_name: string;
  description?: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  course_id?: string;
  lesson_id?: string;
  category: FileCategory;
  access_level?: AccessLevel;
  extra_metadata?: Record<string, unknown>;
}

export interface FileAssetUpdate {
  display_name?: string;
  description?: string;
  access_level?: AccessLevel;
  category?: FileCategory;
  status?: FileStatus;
  extra_metadata?: Record<string, unknown>;
}

// Mapa de extensión → tipo de archivo
export const EXTENSION_TO_FILE_TYPE: Record<string, FileType> = {
  pdf: "pdf",
  mp4: "video",
  webm: "video",
  mov: "video",
  avi: "video",
  mkv: "video",
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  doc: "document",
  docx: "document",
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  ppt: "presentation",
  pptx: "presentation",
  zip: "archive",
  rar: "archive",
  gz: "archive",
};

export function inferFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_FILE_TYPE[ext] ?? "other";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Categoría automática según tipo de archivo
export function defaultBucketForCategory(category: FileCategory): StorageBucket {
  const map: Record<FileCategory, StorageBucket> = {
    video: "course-videos",
    recording: "mentor-recordings",
    thumbnail: "thumbnails",
    certificate: "certificates",
    assignment: "assignments",
    resource: "resources",
    avatar: "avatars",
    event: "events",
    community: "community",
    material: "course-materials",
    guide: "course-materials",
    exam: "course-materials",
    project: "attachments",
    attachment: "attachments",
  };
  return map[category];
}
