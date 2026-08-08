/**
 * Construye el MentorContext unificando datos del estudiante.
 * Agnóstico de origen de datos: recibe objetos ya cargados.
 */

import type { GamificationState } from '@/lib/gamification/types'
import type { Course, CurrentUser, Reservation } from '@/lib/edtech/types'
import type { OnboardingData } from '@/lib/onboarding/service'
import type { MentorContext } from './types'

export function buildMentorContext(
  user: CurrentUser,
  gamification: GamificationState | null,
  courses: Course[],
  reservations: Reservation[],
  onboarding: OnboardingData | null,
  orbits = 0,
): MentorContext {
  const activeReservations = reservations.filter((r) => r.status !== 'cancelled')

  return {
    userName: user.name || onboarding?.full_name || 'Estudiante',
    goals: onboarding?.goals ?? [],
    subjects: onboarding?.subject_tags ?? [],
    projectInterests: onboarding?.project_interests ?? [],
    learningStyles: onboarding?.learning_styles ?? [],
    streakDays: gamification?.streak.current ?? 0,
    recentActivity: [],
    xp: gamification?.xp ?? 0,
    level: gamification?.level.title ?? 'Explorador',
    weeklyXP: gamification?.weeklyXP ?? 0,
    weeklyGoal: gamification?.weeklyGoal ?? 500,
    orbits,
    reservationsCount: activeReservations.length,
    coursesCount: courses.length,
  }
}
