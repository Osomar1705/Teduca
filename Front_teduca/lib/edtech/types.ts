/**
 * Dominio EdTech de TEDUCA (perfiles docentes, cursos, descubrimiento, reservas).
 *
 * Esta capa es agnóstica del origen de datos: hoy la alimenta un mock
 * (`./mock`), mañana el backend FastAPI. Los componentes solo consumen
 * `./service`, nunca los datos directamente.
 */

export type Modality = 'virtual' | 'in-person' | 'both'

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export type SocialNetwork =
  | 'website'
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'youtube'

export interface SocialLink {
  type: SocialNetwork
  url: string
}

export interface AvailabilitySlot {
  /** Día de la semana en formato corto (Lun, Mar, ...). */
  day: string
  /** Franjas horarias legibles, p.ej. "09:00 - 12:00". */
  slots: string[]
}

export interface TeacherProfile {
  id: string
  userId: string
  name: string
  avatar: string
  /** Especialidad principal, p.ej. "Matemática · Cálculo". */
  specialty: string
  bio: string
  experienceYears: number
  university: string
  /** Nombres de los cursos que dicta (ids en `courses`). */
  courseIds: string[]
  modality: Modality
  hourlyPrice: number
  currency: string
  languages: string[]
  availability: AvailabilitySlot[]
  rating: number
  reviewsCount: number
  studentsCount: number
  categories: string[]
  location?: string
  socials?: SocialLink[]
}

export interface Course {
  id: string
  title: string
  image: string
  category: string
  description: string
  level: CourseLevel
  durationHours: number
  teacherId: string
  teacherName: string
  price: number
  currency: string
  rating: number
  reviewsCount: number
}

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface Reservation {
  id: string
  userId: string
  studentName: string
  teacherId: string
  teacherName: string
  teacherAvatar: string
  courseId?: string
  courseTitle?: string
  date: string // ISO date "YYYY-MM-DD"
  time: string // "18:00"
  modality: Modality
  price: number
  currency: string
  status: ReservationStatus
  createdAt: string
}

export type SwipeDirection = 'left' | 'right'

export interface SwipeResult {
  matched: boolean
  teacher: TeacherProfile
}

export interface ChatThread {
  id: string
  teacherId: string
  teacherName: string
  teacherAvatar: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  threadId: string
  senderId: string
  body: string
  createdAt: string
}

/** Usuario en sesión (desde el backend FastAPI). */
export interface CurrentUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'student' | 'teacher'
  email_verified: boolean
}
