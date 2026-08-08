/**
 * Construye el contexto académico que se le inyecta al modelo.
 *
 * Regla de alcance: el mentor solo debe conocer lo que el alumno está
 * estudiando (cursos y, en el futuro, transcripciones de sus clases). Los
 * datos de gamificación (XP, racha, orbits) quedan deliberadamente fuera:
 * viven en el dashboard y ensuciaban las respuestas del chat.
 */

import type { Course, CurrentUser } from '@/lib/edtech/types'
import type { OnboardingData } from '@/lib/onboarding/service'
import type { ClassTranscript, ContextCourse, StudentContext } from './types'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'inicial',
  intermediate: 'intermedio',
  advanced: 'avanzado',
}

/**
 * Traduce las claves crudas del onboarding a texto legible.
 * Sin esto el modelo recibe cosas como "live_classes" o "learn" y las repite
 * tal cual (el bug que se veía en las tarjetas viejas del mentor).
 */
const GOAL_LABELS: Record<string, string> = {
  learn: 'aprender algo nuevo',
  improve: 'mejorar sus notas',
  exam: 'preparar un examen',
  career: 'crecer profesionalmente',
  project: 'sacar adelante un proyecto',
}

const STYLE_LABELS: Record<string, string> = {
  live_classes: 'clases en vivo',
  videos: 'videos grabados',
  reading: 'lectura',
  practice: 'ejercicios prácticos',
  group: 'estudio en grupo',
}

function humanize(value: string, dictionary: Record<string, string>): string {
  return dictionary[value] ?? value.replace(/_/g, ' ')
}

function toContextCourse(course: Course): ContextCourse {
  return {
    id: course.id,
    title: course.title,
    category: course.category,
    level: LEVEL_LABELS[course.level] ?? course.level,
    teacherName: course.teacherName,
  }
}

export function buildStudentContext(
  user: CurrentUser,
  courses: Course[],
  onboarding: OnboardingData | null,
  transcripts: ClassTranscript[] = [],
): StudentContext {
  const goals = (onboarding?.goals ?? []).map((g) => humanize(g, GOAL_LABELS))
  const styles = (onboarding?.learning_styles ?? []).map((s) =>
    humanize(s, STYLE_LABELS),
  )

  return {
    userName: user.name || onboarding?.full_name || 'Estudiante',
    courses: courses.map(toContextCourse),
    transcripts,
    goals,
    subjects: [...(onboarding?.subject_tags ?? []), ...styles],
  }
}
