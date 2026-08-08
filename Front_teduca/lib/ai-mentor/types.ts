/**
 * Tipos del Mentor IA.
 *
 * El chat habla con un modelo real vía `/api/mentor` (server-side). Los roles
 * siguen la convención de la API de chat completions ('user' | 'assistant')
 * para no tener que traducir en cada request.
 */

export type MentorRole = 'user' | 'assistant'

export interface MentorMessage {
  id: string
  role: MentorRole
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  /** Se autogenera con las primeras palabras del primer mensaje del alumno. */
  title: string
  messages: MentorMessage[]
  createdAt: string
  updatedAt: string
}

// ─── Contexto académico que se le inyecta al modelo ─────────────────────────

/** Un curso que el alumno está llevando ahora mismo. */
export interface ContextCourse {
  id: string
  title: string
  category: string
  level: string
  teacherName: string
}

/**
 * Fragmento de transcripción de una clase.
 *
 * Todavía no se alimenta con nada: las mentorías por videollamada aún no
 * ocurren. La estructura queda definida para que, cuando exista la grabación,
 * la ingesta solo tenga que producir objetos de esta forma y el prompt ya
 * sepa consumirlos. Ver `buildSystemPrompt`.
 */
export interface ClassTranscript {
  id: string
  courseId: string
  courseTitle: string
  /** Fecha de la clase en ISO. */
  date: string
  /** Texto de la transcripción, ya troceado a un tamaño razonable. */
  excerpt: string
}

export interface StudentContext {
  userName: string
  /** Cursos activos: el material principal del que el mentor debe hablar. */
  courses: ContextCourse[]
  /** Vacío por ahora. Ver ClassTranscript. */
  transcripts: ClassTranscript[]
  /** Metas declaradas en el onboarding, en texto legible. */
  goals: string[]
  subjects: string[]
}
