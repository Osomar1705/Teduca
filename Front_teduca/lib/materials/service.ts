import { apiClient } from '../api-client'
import type { CourseMaterial, CourseMaterialCreate, CourseMaterialUpdate } from './types'

const BASE = '/api/v1/materials'

interface ApiMaterial {
  id: string
  teacher_profile_id: string
  marketplace_course_id: string | null
  title: string
  description: string | null
  material_type: string
  url: string
  sort_order: number
  created_at: string
}

function toMaterial(m: ApiMaterial): CourseMaterial {
  return {
    id: m.id,
    teacherProfileId: m.teacher_profile_id,
    marketplaceCourseId: m.marketplace_course_id,
    title: m.title,
    description: m.description,
    materialType: m.material_type as CourseMaterial['materialType'],
    url: m.url,
    sortOrder: m.sort_order,
    createdAt: m.created_at,
  }
}

export async function createMaterial(data: CourseMaterialCreate): Promise<CourseMaterial> {
  const m = await apiClient.post<ApiMaterial>(BASE, {
    marketplace_course_id: data.marketplaceCourseId ?? null,
    title: data.title,
    description: data.description ?? null,
    material_type: data.materialType,
    url: data.url,
    sort_order: data.sortOrder ?? 0,
  })
  return toMaterial(m)
}

export async function getMyMaterials(courseId?: string): Promise<CourseMaterial[]> {
  const url = courseId
    ? `${BASE}/teacher/me?course_id=${courseId}`
    : `${BASE}/teacher/me`
  const items = await apiClient.get<ApiMaterial[]>(url)
  return items.map(toMaterial)
}

export async function getCourseMaterials(courseId: string): Promise<CourseMaterial[]> {
  const items = await apiClient.get<ApiMaterial[]>(`${BASE}/course/${courseId}`)
  return items.map(toMaterial)
}

export async function updateMaterial(id: string, data: CourseMaterialUpdate): Promise<CourseMaterial> {
  const m = await apiClient.put<ApiMaterial>(`${BASE}/${id}`, {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.materialType !== undefined && { material_type: data.materialType }),
    ...(data.url !== undefined && { url: data.url }),
    ...(data.sortOrder !== undefined && { sort_order: data.sortOrder }),
  })
  return toMaterial(m)
}

export async function deleteMaterial(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`)
}
