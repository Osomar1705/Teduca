/**
 * Capa de servicio del dominio EdTech, cableada al backend FastAPI.
 *
 * Mantiene las mismas firmas que consumía la UI (async, tipos camelCase de
 * `./types`) y por debajo llama a `/api/v1/edtech/*` mapeando el snake_case
 * del backend. Toda la persistencia (favoritos, swipes, reservas, perfil,
 * chat) vive ahora en la base de datos.
 */

import { apiClient } from '../api-client'
import { API_ENDPOINTS } from '../constants'
import type { User } from '../types'
import type {
  ChatMessage,
  ChatThread,
  Course,
  CurrentUser,
  Reservation,
  SwipeDirection,
  SwipeResult,
  TeacherProfile,
} from './types'

const BASE = '/api/v1/edtech'

// --- DTOs del backend (snake_case) ---------------------------------------
interface ApiCourse {
  id: string
  teacher_profile_id: string
  teacher_name: string
  title: string
  image: string
  category: string
  description: string
  level: Course['level']
  duration_hours: number
  price: number
  currency: string
  rating: number
  reviews_count: number
}

interface ApiTeacher {
  id: string
  user_id: string
  name: string
  avatar: string | null
  specialty: string
  bio: string
  experience_years: number
  university: string
  modality: TeacherProfile['modality']
  hourly_price: number
  currency: string
  location: string
  languages: string[]
  availability: TeacherProfile['availability']
  categories: string[]
  socials: TeacherProfile['socials']
  is_published: boolean
  rating: number
  reviews_count: number
  students_count: number
  courses: ApiCourse[]
}

interface ApiReservation {
  id: string
  user_id: string
  student_name: string
  teacher_profile_id: string
  teacher_name: string
  teacher_avatar: string | null
  marketplace_course_id: string | null
  course_title: string | null
  date: string
  time: string
  modality: Reservation['modality']
  price: number
  currency: string
  status: Reservation['status']
  created_at: string
}

interface ApiThread {
  id: string
  teacher_profile_id: string
  teacher_name: string
  teacher_avatar: string | null
  updated_at: string
}

interface ApiMessage {
  id: string
  thread_id: string
  sender_id: string
  body: string
  created_at: string
}

const FALLBACK_AVATAR = '/placeholder-user.jpg'

function toCourse(c: ApiCourse): Course {
  return {
    id: c.id,
    title: c.title,
    image: c.image || '/placeholder.jpg',
    category: c.category,
    description: c.description,
    level: c.level,
    durationHours: c.duration_hours,
    teacherId: c.teacher_profile_id,
    teacherName: c.teacher_name,
    price: Number(c.price),
    currency: c.currency,
    rating: Number(c.rating),
    reviewsCount: c.reviews_count,
  }
}

function toTeacher(t: ApiTeacher): TeacherProfile {
  return {
    id: t.id,
    userId: t.user_id,
    name: t.name,
    avatar: t.avatar || FALLBACK_AVATAR,
    specialty: t.specialty,
    bio: t.bio,
    experienceYears: t.experience_years,
    university: t.university,
    courseIds: t.courses.map((c) => c.id),
    modality: t.modality,
    hourlyPrice: Number(t.hourly_price),
    currency: t.currency,
    languages: t.languages,
    availability: t.availability,
    rating: Number(t.rating),
    reviewsCount: t.reviews_count,
    studentsCount: t.students_count,
    categories: t.categories,
    location: t.location || undefined,
    socials: t.socials?.length ? t.socials : undefined,
  }
}

function toReservation(r: ApiReservation): Reservation {
  return {
    id: r.id,
    userId: r.user_id,
    studentName: r.student_name || '',
    teacherId: r.teacher_profile_id,
    teacherName: r.teacher_name,
    teacherAvatar: r.teacher_avatar || FALLBACK_AVATAR,
    courseId: r.marketplace_course_id ?? undefined,
    courseTitle: r.course_title ?? undefined,
    date: r.date,
    time: r.time,
    modality: r.modality,
    price: Number(r.price),
    currency: r.currency,
    status: r.status,
    createdAt: r.created_at,
  }
}

function toThread(t: ApiThread): ChatThread {
  return {
    id: t.id,
    teacherId: t.teacher_profile_id,
    teacherName: t.teacher_name,
    teacherAvatar: t.teacher_avatar || FALLBACK_AVATAR,
    updatedAt: t.updated_at,
  }
}

function toMessage(m: ApiMessage): ChatMessage {
  return {
    id: m.id,
    threadId: m.thread_id,
    senderId: m.sender_id,
    body: m.body,
    createdAt: m.created_at,
  }
}

// --- Usuario -------------------------------------------------------------
export async function getCurrentUser(): Promise<CurrentUser> {
  const user = await apiClient.get<User & { roles?: { name: string }[] }>(
    API_ENDPOINTS.AUTH.SESSION
  )
  const roles = user.roles?.map((r) => r.name) ?? []
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? undefined,
    role: roles.includes('teacher') ? 'teacher' : 'student',
    email_verified: (user as unknown as Record<string, unknown>).email_verified !== false,
  }
}

// --- Mi perfil (docente editable) ---------------------------------------
/** Campos editables por el docente. Rating/alumnos/reseñas son de solo lectura. */
export type EditableProfile = Omit<
  TeacherProfile,
  'rating' | 'reviewsCount' | 'studentsCount'
>

export async function getMyProfile(): Promise<TeacherProfile> {
  const profile = await apiClient.get<ApiTeacher>(`${BASE}/me/profile`)
  return toTeacher(profile)
}

export async function saveMyProfile(
  profile: EditableProfile
): Promise<TeacherProfile> {
  // Nombre y avatar viven en la cuenta de usuario (PATCH /users/me).
  await apiClient.patch(API_ENDPOINTS.USER.PROFILE, {
    name: profile.name,
    avatar: profile.avatar,
  })
  const updated = await apiClient.put<ApiTeacher>(`${BASE}/me/profile`, {
    specialty: profile.specialty,
    bio: profile.bio,
    experience_years: profile.experienceYears,
    university: profile.university,
    modality: profile.modality,
    hourly_price: profile.hourlyPrice,
    currency: profile.currency,
    location: profile.location ?? '',
    languages: profile.languages,
    availability: profile.availability,
    categories: profile.categories,
    socials: profile.socials ?? [],
    is_published: true,
  })
  return toTeacher(updated)
}

// --- Profesores ----------------------------------------------------------
export async function getTeachers(): Promise<TeacherProfile[]> {
  const teachers = await apiClient.get<ApiTeacher[]>(`${BASE}/teachers`)
  return teachers.map(toTeacher)
}

export async function getTeacher(id: string): Promise<TeacherProfile | null> {
  try {
    return toTeacher(await apiClient.get<ApiTeacher>(`${BASE}/teachers/${id}`))
  } catch {
    return null
  }
}

// --- Cursos --------------------------------------------------------------
export async function getCourses(): Promise<Course[]> {
  const courses = await apiClient.get<ApiCourse[]>(`${BASE}/courses`)
  return courses.map(toCourse)
}

export async function getCourse(id: string): Promise<Course | null> {
  try {
    return toCourse(await apiClient.get<ApiCourse>(`${BASE}/courses/${id}`))
  } catch {
    return null
  }
}

export async function getCoursesByTeacher(
  teacherId: string
): Promise<Course[]> {
  const courses = await apiClient.get<ApiCourse[]>(
    `${BASE}/courses?teacher_profile_id=${teacherId}`
  )
  return courses.map(toCourse)
}

// --- Descubrir (deck para swipe) ----------------------------------------
export async function getDiscoverDeck(): Promise<TeacherProfile[]> {
  const deck = await apiClient.get<ApiTeacher[]>(`${BASE}/discover`)
  return deck.map(toTeacher)
}

export async function swipeTeacher(
  teacherId: string,
  direction: SwipeDirection
): Promise<SwipeResult> {
  const result = await apiClient.post<{ matched: boolean; teacher: ApiTeacher }>(
    `${BASE}/discover/${teacherId}/swipe`,
    { direction }
  )
  return { matched: result.matched, teacher: toTeacher(result.teacher) }
}

export async function resetDeck(): Promise<void> {
  await apiClient.post(`${BASE}/discover/reset`)
}

// --- Favoritos -----------------------------------------------------------
export async function getFavorites(): Promise<TeacherProfile[]> {
  const favorites = await apiClient.get<ApiTeacher[]>(`${BASE}/favorites`)
  return favorites.map(toTeacher)
}

export async function isFavorite(teacherId: string): Promise<boolean> {
  const res = await apiClient.get<{ is_favorite: boolean }>(
    `${BASE}/favorites/${teacherId}`
  )
  return res.is_favorite
}

export async function toggleFavorite(teacherId: string): Promise<boolean> {
  const res = await apiClient.post<{ is_favorite: boolean }>(
    `${BASE}/favorites/${teacherId}/toggle`
  )
  return res.is_favorite
}

// --- Reservas ------------------------------------------------------------
export async function getReservations(): Promise<Reservation[]> {
  const reservations = await apiClient.get<ApiReservation[]>(`${BASE}/reservations`)
  return reservations.map(toReservation)
}

export async function createReservation(
  input: Omit<Reservation, 'id' | 'status' | 'createdAt' | 'userId' | 'studentName'>
): Promise<Reservation> {
  const reservation = await apiClient.post<ApiReservation>(`${BASE}/reservations`, {
    teacher_profile_id: input.teacherId,
    marketplace_course_id: input.courseId ?? null,
    date: input.date,
    time: input.time,
    modality: input.modality,
    price: input.price,
    currency: input.currency,
  })
  return toReservation(reservation)
}

export async function cancelReservation(id: string): Promise<void> {
  await apiClient.post(`${BASE}/reservations/${id}/cancel`)
}

// --- Reservas del profesor -----------------------------------------------

export async function getTeacherReservations(): Promise<Reservation[]> {
  const reservations = await apiClient.get<ApiReservation[]>(`${BASE}/me/reservations`)
  return reservations.map(toReservation)
}

export async function confirmReservation(id: string): Promise<Reservation> {
  const r = await apiClient.post<ApiReservation>(`${BASE}/me/reservations/${id}/confirm`)
  return toReservation(r)
}

export async function completeReservation(id: string): Promise<Reservation> {
  const r = await apiClient.post<ApiReservation>(`${BASE}/me/reservations/${id}/complete`)
  return toReservation(r)
}

export async function cancelReservationAsTeacher(id: string): Promise<Reservation> {
  const r = await apiClient.post<ApiReservation>(`${BASE}/me/reservations/${id}/cancel`)
  return toReservation(r)
}

// --- Chat (habilitado tras un match) -------------------------------------
export async function getChatThreads(): Promise<ChatThread[]> {
  const threads = await apiClient.get<ApiThread[]>(`${BASE}/chat/threads`)
  return threads.map(toThread)
}

export async function openChatThread(teacherId: string): Promise<ChatThread> {
  const thread = await apiClient.post<ApiThread>(`${BASE}/chat/threads/${teacherId}`)
  return toThread(thread)
}

export async function getChatMessages(threadId: string): Promise<ChatMessage[]> {
  const messages = await apiClient.get<ApiMessage[]>(
    `${BASE}/chat/threads/${threadId}/messages`
  )
  return messages.map(toMessage)
}

export async function sendChatMessage(
  threadId: string,
  body: string
): Promise<ChatMessage> {
  const message = await apiClient.post<ApiMessage>(
    `${BASE}/chat/threads/${threadId}/messages`,
    { body }
  )
  return toMessage(message)
}

// --- Stats del profesor ---------------------------------------------------
export interface MonthStat {
  month: string
  count: number
}

export interface TeacherStats {
  students_count: number
  reservations_total: number
  reservations_by_month: MonthStat[]
  rating: number
  reviews_count: number
}

export async function getMyStats(): Promise<TeacherStats> {
  return apiClient.get<TeacherStats>(`${BASE}/me/stats`)
}
