/**
 * Análisis del alumno generado por IA para el dashboard.
 *
 * Reemplaza a las funciones `deriveStrengths`/`deriveAreas` y a las plantillas
 * de `generateDailyRecommendation`, que producían texto fijo a partir de
 * condicionales (y filtraban claves crudas como "live_classes" a la interfaz).
 */

import type { StudentContext } from './types'

export type RecommendationType = 'mentoría' | 'curso' | 'comunidad' | 'estudio'

export interface MentorInsights {
  strengths: string[]
  areas: string[]
  patterns: string[]
  recommendation: {
    type: RecommendationType
    text: string
  }
}

/** Señales de actividad que el modelo necesita para el análisis. */
export interface ActivitySignals {
  streakDays: number
  weeklyXP: number
  weeklyGoal: number
  reservationsCount: number
}

/** Arma el resumen en texto plano que se le manda al modelo. */
function buildSummary(context: StudentContext, signals: ActivitySignals): string {
  const courses =
    context.courses.length > 0
      ? context.courses
          .map((c) => `${c.title} (${c.category}, nivel ${c.level})`)
          .join('; ')
      : 'ninguno'

  return [
    `Alumno: ${context.userName}.`,
    `Cursos activos: ${courses}.`,
    `Metas: ${context.goals.length > 0 ? context.goals.join(', ') : 'no declaradas'}.`,
    `Intereses: ${context.subjects.length > 0 ? context.subjects.join(', ') : 'no declarados'}.`,
    `Racha actual: ${signals.streakDays} días.`,
    `XP de esta semana: ${signals.weeklyXP} de ${signals.weeklyGoal}.`,
    `Mentorías reservadas: ${signals.reservationsCount}.`,
  ].join('\n')
}

export async function getMentorInsights(
  context: StudentContext,
  signals: ActivitySignals,
): Promise<MentorInsights> {
  const response = await fetch('/api/mentor/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary: buildSummary(context, signals) }),
  })

  if (!response.ok) {
    throw new Error('No se pudo generar el análisis.')
  }

  return response.json()
}
