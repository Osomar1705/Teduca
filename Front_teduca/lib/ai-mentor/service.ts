/**
 * Servicio principal del Mentor TEDUCA.
 * Orquesta: contexto del usuario, generación de contenido y respuestas de chat.
 * Preparado para conectarse a `/api/v1/ai/mentor/` en el futuro.
 */

import type { MentorContext, MentorData, MentorMessage } from './types'
import { buildMentorContext } from './context'
import {
  generateGreeting,
  generateDailyRecommendation,
  generateWeeklyGoal,
  generatePatternAnalysis,
} from './prompts'
import { getCurrentUser, getCourses, getReservations } from '@/lib/edtech/service'
import { getGamificationState } from '@/lib/gamification/service'
import { getOnboarding } from '@/lib/onboarding/service'

// ─── getMentorData ──────────────────────────────────────────────────────────

export async function getMentorData(): Promise<MentorData> {
  const [user, courses, reservations] = await Promise.all([
    getCurrentUser(),
    getCourses(),
    getReservations(),
  ])

  const gamification = getGamificationState()

  let onboarding = null
  try {
    onboarding = await getOnboarding()
  } catch {
    // onboarding may not be completed yet
  }

  const context = buildMentorContext(user, gamification, courses, reservations, onboarding)

  return {
    context,
    greeting: generateGreeting(context),
    recommendation: generateDailyRecommendation(context),
    weeklyGoal: generateWeeklyGoal(context),
    patterns: generatePatternAnalysis(context),
  }
}

// ─── sendMessage (chat) ─────────────────────────────────────────────────────

function firstName(name: string): string {
  return name.split(' ')[0] || 'estudiante'
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function matches(msg: string, keywords: string[]): boolean {
  const lower = msg.toLowerCase()
  return keywords.some((k) => lower.includes(k))
}

function buildReply(message: string, ctx: MentorContext): string {
  const name = firstName(ctx.userName)
  const subject = ctx.subjects[0]
  const goal = ctx.goals[0]

  if (matches(message, ['motiv', 'ánimo', 'animo', 'cansad', 'desmotiv', 'rendi'])) {
    return pick([
      `${name}, cada sesión de estudio suma. Llevás ${ctx.streakDays} día(s) de racha: eso demuestra constancia. Fijate un mini objetivo hoy y celebralo al lograrlo.`,
      `El progreso no siempre se siente, pero está. Volvé a tu "por qué"${goal ? `: querés ${goal.toLowerCase()}` : ''}. Un bloque de 25 minutos enfocado ya es un avance real.`,
    ])
  }

  if (matches(message, ['curso', 'aprender', 'estudiar qué', 'recomend'])) {
    return `Con base en tus intereses${subject ? ` (${subject})` : ''}, te recomiendo explorar la sección de Cursos. Buscá uno de nivel introductorio y comprometete a completar la primera lección esta semana.`
  }

  if (matches(message, ['semana', 'organiz', 'planific', 'tiempo', 'horario'])) {
    return pick([
      `Probá esto, ${name}: dividí tu semana en bloques de 25 minutos (técnica Pomodoro). Reservá 3 bloques diarios${subject ? ` para ${subject}` : ''} y dejá los fines de semana para repaso.`,
      `Empezá por tus 2 prioridades de la semana, agendalas a la misma hora cada día para crear un hábito, y protegé ese tiempo como una clase más.`,
    ])
  }

  if (matches(message, ['racha', 'streak', 'constancia', 'hábito', 'habito'])) {
    return `Para mejorar tu racha (${ctx.streakDays} día(s)), hacé una micro-actividad diaria: leer 1 página o resolver 1 ejercicio cuenta. Lo importante es no romper la cadena.`
  }

  if (matches(message, ['explica', 'concepto', 'entender', 'no entiendo', 'duda'])) {
    return `Contame qué concepto${subject ? ` de ${subject}` : ''} querés entender y te lo explico paso a paso, con un ejemplo simple y una analogía. ¿Cuál es tu duda puntual?`
  }

  if (matches(message, ['examen', 'prueba', 'parcial', 'test'])) {
    return `Para preparar un examen, ${name}: 1) hacé un resumen activo del tema, 2) resolvé ejercicios sin mirar apuntes, 3) repasá solo lo que fallaste. La práctica supera a la relectura.`
  }

  if (matches(message, ['hola', 'buenas', 'hey', 'qué tal', 'que tal'])) {
    return `¡Hola ${name}! Estoy acá para ayudarte a organizar tu estudio, resolver dudas y mantenerte motivado. ¿Por dónde querés empezar hoy?`
  }

  if (matches(message, ['xp', 'nivel', 'puntos', 'progreso'])) {
    return `Tenés ${ctx.xp} XP y sos nivel "${ctx.level}". Esta semana ganaste ${ctx.weeklyXP} XP de los ${ctx.weeklyGoal} posibles. ¡Seguí así!`
  }

  return pick([
    `Buena pregunta, ${name}. Contame un poco más de contexto y armamos un plan concreto${goal ? ` para acercarte a "${goal}"` : ''}.`,
    `Puedo ayudarte con eso. ¿Querés que lo dividamos en pasos accionables para esta semana?`,
  ])
}

export async function sendMessage(
  history: MentorMessage[],
  message: string,
  context: MentorContext,
): Promise<string> {
  // Simulated delay (replace with fetch('/api/ai-mentor') in the future)
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 400))
  return buildReply(message, context)
}

// Keep backward-compatible export for MentorChat
export async function sendMentorMessage(
  message: string,
  context: MentorContext,
  history: MentorMessage[],
): Promise<string> {
  return sendMessage(history, message, context)
}
