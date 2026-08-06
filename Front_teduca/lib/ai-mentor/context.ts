/**
 * Construye el MentorContext unificando datos del estudiante.
 * Agnóstico de origen de datos: recibe objetos ya cargados.
 */

import type { GamificationState } from '@/lib/gamification/types'
import type { Course, CurrentUser, Reservation } from '@/lib/edtech/types'
import type { OnboardingData } from '@/lib/onboarding/service'
import { getRewardBalance } from '@/lib/rewards/service'
import type { MentorContext } from './types'

export function buildMentorContext(
  user: CurrentUser,
  gamification: GamificationState,
  courses: Course[],
  reservations: Reservation[],
  onboarding: OnboardingData | null,
): MentorContext {
  const activeReservations = reservations.filter((r) => r.status !== 'cancelled')
  const orbits = getRewardBalance().total

  return {
    userName: user.name || onboarding?.full_name || 'Estudiante',
    goals: onboarding?.goals ?? [],
    subjects: onboarding?.subject_tags ?? [],
    projectInterests: onboarding?.project_interests ?? [],
    learningStyles: onboarding?.learning_styles ?? [],
    streakDays: gamification.streak.current,
    recentActivity: [],
    xp: gamification.xp,
    level: gamification.level.title,
    weeklyXP: gamification.weeklyXP,
    weeklyGoal: gamification.weeklyGoal,
    orbits,
    reservationsCount: activeReservations.length,
    coursesCount: courses.length,
  }
}
