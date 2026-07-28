/**
 * TEDUCA - Tipos globales de la aplicación
 */

import { UserRole, CourseStatus, AssignmentStatus } from './constants'

// Tipos de Usuario
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile extends User {
  bio?: string
  phone?: string
  organization?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
  emailNotifications: boolean
}

// Tipos de Cursos
export interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  instructor: User
  status: CourseStatus
  studentCount: number
  lessonCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CourseDetail extends Course {
  content: string
  lessons: Lesson[]
  students: User[]
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description?: string
  content: string
  videoUrl?: string
  order: number
  createdAt: Date
  updatedAt: Date
}

// Tipos de Tareas
export interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  dueDate: Date
  status: AssignmentStatus
  createdAt: Date
  updatedAt: Date
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  submission: string
  submittedAt?: Date
  grade?: number
  feedback?: string
  status: AssignmentStatus
}

// Tipos de Respuestas de API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Tipos de Formularios
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  role: UserRole
}

export interface CreateCourseFormData {
  title: string
  description: string
  content: string
  thumbnail?: File
}

export interface CreateAssignmentFormData {
  title: string
  description: string
  dueDate: Date
  courseId: string
}
