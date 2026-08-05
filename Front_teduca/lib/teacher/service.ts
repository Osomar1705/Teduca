import { apiClient } from '@/lib/api-client'

export interface TeacherProfile {
  id: string
  user_id: string
  bio: string
  experience_years: number
  university: string
  specialty: string
  location: string
  hourly_price: number
  currency: string
  modality: 'virtual' | 'presencial' | 'hibrido'
  languages: string[]
  categories: string[]
  socials: { platform: string; url: string }[]
  is_published: boolean
  rating: number
  reviews_count: number
  students_count: number
}

export type TeacherProfileUpdate = Partial<Omit<TeacherProfile, 'id' | 'user_id' | 'rating' | 'reviews_count' | 'students_count'>>

const BASE = '/api/v1/users/me/teacher-profile'

export function getTeacherProfile(): Promise<TeacherProfile> {
  return apiClient.get<TeacherProfile>(BASE)
}

export function updateTeacherProfile(data: TeacherProfileUpdate): Promise<TeacherProfile> {
  return apiClient.patch<TeacherProfile>(BASE, data)
}
