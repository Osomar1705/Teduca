/**
 * Funciones que generan contenido del mentor IA.
 * Hoy devuelven datos simulados pero coherentes con el contexto del usuario.
 * Preparadas para swapear a fetch('/api/ai-mentor') en el futuro.
 */

import type { MentorContext, MentorRecommendation, WeeklyGoal } from './types'
import { APP_ROUTES } from '@/lib/constants'

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

// ─── Greeting ──────────────────────────────────────────────────────────────

export function generateGreeting(ctx: MentorContext): string {
  const firstName = ctx.userName.split(' ')[0] || 'estudiante'
  const prevWeekXP = 120 // simulado — se reemplazará con histórico real
  const pct = prevWeekXP > 0
    ? Math.round(((ctx.weeklyXP - prevWeekXP) / prevWeekXP) * 100)
    : 0

  if (ctx.weeklyXP === 0) {
    return `Esta semana todavía no registraste actividad. Hoy es un buen momento para empezar.`
  }
  if (pct > 0) {
    return `Esta semana avanzaste un ${pct}% más que la semana pasada. Vas bien.`
  }
  if (pct < 0) {
    return `Esta semana bajaste un poco el ritmo. Nada grave: es normal. ¿Qué necesitás para retomar?`
  }
  return `Mantuviste el ritmo de la semana pasada. Consistencia es la clave.`
}

// ─── Daily Recommendation ──────────────────────────────────────────────────

export function generateDailyRecommendation(ctx: MentorContext): MentorRecommendation {
  // Si no tiene reservas: recomendar mentoría
  if (ctx.reservationsCount === 0) {
    const subject = ctx.subjects[0] || 'un área de tu interés'
    return {
      type: 'mentoría',
      text: `Todavía no reservaste ninguna mentoría. Una sesión con un profesor puede acelerar mucho tu comprensión de ${subject}. Explorá los perfiles disponibles.`,
      ctaLabel: 'Descubrir profesores',
      ctaHref: APP_ROUTES.DISCOVER,
    }
  }

  // Si tiene cursos: recomendar retomar
  if (ctx.coursesCount > 0) {
    return {
      type: 'curso',
      text: `Tenés cursos en progreso. Dedicar 20 minutos hoy a continuar donde lo dejaste es más efectivo que empezar algo nuevo.`,
      ctaLabel: 'Ver mis cursos',
      ctaHref: APP_ROUTES.COURSES,
    }
  }

  // Si tiene metas definidas: recomendar según goals
  if (ctx.goals.length > 0) {
    const goal = ctx.goals[0]
    return {
      type: 'estudio',
      text: `Tu meta es "${goal}". Un buen paso hoy es dedicar 30 minutos a una actividad específica que te acerque a ese objetivo. La constancia supera a la intensidad.`,
    }
  }

  // Default: participar en comunidad
  return {
    type: 'comunidad',
    text: `Participar en la comunidad es una forma subvalorada de aprender. Responder una duda de otro estudiante solidifica lo que ya sabés.`,
    ctaLabel: 'Ir a comunidad',
    ctaHref: APP_ROUTES.COMMUNITY,
  }
}

// ─── Weekly Goal ───────────────────────────────────────────────────────────

const WEEKLY_GOALS_POOL: Omit<WeeklyGoal, 'progress' | 'completed'>[] = [
  {
    title: 'Sesión de estudio',
    description: 'Completá al menos 3 sesiones de estudio de 25 minutos esta semana.',
    xpReward: 50,
  },
  {
    title: 'Reservá una mentoría',
    description: 'Agendá una sesión con un profesor para avanzar en tu área de interés.',
    xpReward: 75,
  },
  {
    title: 'Participá en comunidad',
    description: 'Respondé o hacé al menos una pregunta en la comunidad de TEDUCA.',
    xpReward: 40,
  },
  {
    title: 'Completá un módulo',
    description: 'Finalizá al menos un módulo de cualquiera de tus cursos activos.',
    xpReward: 60,
  },
]

export function generateWeeklyGoal(ctx: MentorContext): WeeklyGoal {
  // Rotar el objetivo según la semana del año para que no sea aleatorio en cada render
  const weekOfYear = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000))
  const base = WEEKLY_GOALS_POOL[weekOfYear % WEEKLY_GOALS_POOL.length]

  // Progreso basado en XP semanal vs meta
  const rawProgress = ctx.weeklyGoal > 0
    ? Math.min(100, Math.round((ctx.weeklyXP / ctx.weeklyGoal) * 100))
    : 0
  const completed = rawProgress >= 100

  return {
    ...base,
    progress: rawProgress,
    completed,
  }
}

// ─── Pattern Analysis ──────────────────────────────────────────────────────

export function generatePatternAnalysis(ctx: MentorContext): string[] {
  const patterns: string[] = []

  if (ctx.streakDays >= 7) {
    patterns.push(`Racha de ${ctx.streakDays} días consecutivos: demostras disciplina.`)
  } else if (ctx.streakDays >= 3) {
    patterns.push(`Llevas ${ctx.streakDays} días seguidos activo. Seguí así.`)
  } else {
    patterns.push('La regularidad diaria tiene más impacto que los maratones de estudio.')
  }

  if (ctx.subjects.length > 0) {
    patterns.push(`Tu área principal es ${ctx.subjects[0]}. Enfocarte en un tema a la vez mejora la retención.`)
  }

  if (ctx.reservationsCount > 2) {
    patterns.push(`Ya reservaste ${ctx.reservationsCount} mentorías. Las clases personalizadas aceleran el progreso.`)
  } else if (ctx.reservationsCount === 0) {
    patterns.push('Todavía no tuviste mentorías. Una sesión puede desbloquear conceptos que no avanzan solos.')
  }

  if (ctx.goals.length > 0) {
    patterns.push(`Tu meta declarada es "${ctx.goals[0]}". Recordarla ayuda a tomar mejores decisiones de aprendizaje.`)
  }

  return patterns
}

// ─── Chat Response ─────────────────────────────────────────────────────────
// (La lógica de chat vive en service.ts para mantener la separación)
