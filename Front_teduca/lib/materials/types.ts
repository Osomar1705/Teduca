export type MaterialType = 'video' | 'pdf' | 'document' | 'presentation' | 'link' | 'other'

export interface CourseMaterial {
  id: string
  teacherProfileId: string
  marketplaceCourseId: string | null
  title: string
  description: string | null
  materialType: MaterialType
  url: string
  sortOrder: number
  createdAt: string
}

export interface CourseMaterialCreate {
  marketplaceCourseId?: string | null
  title: string
  description?: string | null
  materialType: MaterialType
  url: string
  sortOrder?: number
}

export interface CourseMaterialUpdate {
  title?: string
  description?: string | null
  materialType?: MaterialType
  url?: string
  sortOrder?: number
}
