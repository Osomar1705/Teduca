import { apiClient } from '../api-client'
import { API_ENDPOINTS } from '../constants'
import type { GamificationState, Streak, UserLevel } from './types'

export const LEVELS: UserLevel[] = [
  { level: 1, title: 'Explorador', xpMin: 0, xpMax: 100, color: '#94a3b8' },
  { level: 2, title: 'Estudiante', xpMin: 100, xpMax: 250, color: '#64748b' },
  { level: 3, title: 'Aprendiz', xpMin: 250, xpMax: 500, color: '#0ea5e9' },
  { level: 4, title: 'Practicante', xpMin: 500, xpMax: 900, color: '#06b6d4' },
  { level: 5, title: 'Competente', xpMin: 900, xpMax: 1500, color: '#10b981' },
  { level: 6, title: 'Avanzado', xpMin: 1500, xpMax: 2400, color: '#84cc16' },
  { level: 7, title: 'Experto', xpMin: 2400, xpMax: 3800, color: '#eab308' },
  { level: 8, title: 'Maestro', xpMin: 3800, xpMax: 6000, color: '#f97316' },
  { level: 9, title: 'Sabio', xpMin: 6000, xpMax: 9500, color: '#a855f7' },
  { level: 10, title: 'Leyenda', xpMin: 9500, xpMax: Infinity, color: '#6366f1' },
]

export function getLevelByXP(xp: number): UserLevel {
  return (
    LEVELS.find((l) => xp >= l.xpMin && xp < l.xpMax) ?? LEVELS[LEVELS.length - 1]
  )
}

interface ApiGamificationSummary {
  total_points: number
  current_streak: number
  longest_streak: number
  last_active_date: string | null
}

/**
 * Obtiene el estado de gamificación del usuario autenticado desde el backend.
 */
export async function getGamificationState(): Promise<GamificationState> {
  const summary = await apiClient.get<ApiGamificationSummary>(API_ENDPOINTS.GAMIFICATION.ME)

  const xp = summary.total_points ?? 0
  const streak: Streak = {
    current: summary.current_streak ?? 0,
    longest: summary.longest_streak ?? 0,
    lastActiveDate: summary.last_active_date ?? null,
  }

  return {
    xp,
    level: getLevelByXP(xp),
    streak,
    achievements: [],
    weeklyXP: 0,
    weeklyGoal: 500,
  }
}

/**
 * Registra actividad diaria en el backend (llama al mismo endpoint GET,
 * que el backend actualiza automáticamente al consultarse).
 * Devuelve la racha actualizada.
 */
export async function recordDailyActivity(): Promise<Streak> {
  const summary = await apiClient.get<ApiGamificationSummary>(API_ENDPOINTS.GAMIFICATION.ME)
  return {
    current: summary.current_streak ?? 0,
    longest: summary.longest_streak ?? 0,
    lastActiveDate: summary.last_active_date ?? null,
  }
}
