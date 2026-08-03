/**
 * TEDUCA - Constantes globales de la aplicación
 */

// URLs de la aplicación
export const APP_ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  DISCOVER: '/discover',
  COURSES: '/courses',
  FAVORITES: '/favorites',
  RESERVATIONS: '/reservations',
  MESSAGES: '/messages',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  FOR_YOU: '/for-you',
  NOTIFICATIONS: '/notifications',
  ACHIEVEMENTS: '/achievements',
  PARTICIPATE: '/participate',
  REWARDS: '/rewards',
  REWARDS_HISTORY: '/rewards/history',
  RANKING: '/rewards',
} as const

// API endpoints (backend FastAPI, versionado /api/v1)
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    SESSION: '/api/v1/users/me',
    CONFIG: '/api/v1/auth/config',
    GOOGLE: '/api/v1/auth/google',
  },
  COURSES: {
    LIST: '/api/v1/courses',
    CREATE: '/api/v1/courses',
    GET_BY_ID: (id: string) => `/api/v1/courses/${id}`,
    UPDATE: (id: string) => `/api/v1/courses/${id}`,
    DELETE: (id: string) => `/api/v1/courses/${id}`,
    LESSONS: (id: string) => `/api/v1/courses/${id}/lessons`,
    ASSIGNMENTS: (id: string) => `/api/v1/courses/${id}/assignments`,
    ENROLL: (id: string) => `/api/v1/courses/${id}/enroll`,
  },
  ASSIGNMENTS: {
    GET_BY_ID: (id: string) => `/api/v1/assignments/${id}`,
    SUBMIT: (id: string) => `/api/v1/assignments/${id}/submit`,
  },
  SUBMISSIONS: {
    GRADE: (id: string) => `/api/v1/submissions/${id}/grade`,
  },
  ENROLLMENTS: {
    MINE: '/api/v1/enrollments/me',
  },
  USER: {
    PROFILE: '/api/v1/users/me',
  },
  ONBOARDING: {
    STATUS: '/api/v1/onboarding/status',
    ME: '/api/v1/onboarding/me',
    CHECK_USERNAME: '/api/v1/onboarding/check-username',
    STEP1: '/api/v1/onboarding/step/1',
    STEP2: '/api/v1/onboarding/step/2',
    STEP3: '/api/v1/onboarding/step/3',
    COMPLETE: '/api/v1/onboarding/complete',
  },
} as const

// Roles de usuario
export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

// Estados de cursos
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// Estados de tareas
export enum AssignmentStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  LATE = 'late',
}

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  AUTHENTICATION_REQUIRED: 'Se requiere autenticación',
  UNAUTHORIZED: 'No tienes permisos para esta acción',
  NOT_FOUND: 'Recurso no encontrado',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet',
  FORM_INVALID: 'Formulario inválido',
  SESSION_EXPIRED: 'Tu sesión ha expirado',
} as const

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Bienvenido a TEDUCA',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  PROFILE_UPDATED: 'Perfil actualizado',
  COURSE_CREATED: 'Curso creado exitosamente',
  COURSE_UPDATED: 'Curso actualizado',
  ASSIGNMENT_SUBMITTED: 'Tarea enviada',
  ASSIGNMENT_GRADED: 'Tarea calificada',
} as const
