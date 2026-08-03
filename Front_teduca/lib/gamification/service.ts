import type { GamificationState, Streak, UserLevel } from './types'

const XP_KEY = 'teduca_xp'
const LAST_ACTIVE_KEY = 'teduca_last_active'
const STREAK_CURRENT_KEY = 'teduca_streak_current'
const STREAK_LONGEST_KEY = 'teduca_streak_longest'
const WEEKLY_XP_KEY = 'teduca_weekly_xp'

const WEEKLY_GOAL = 500

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

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function readNumber(key: string): number {
  if (!isBrowser()) return 0
  const raw = window.localStorage.getItem(key)
  const n = raw ? Number(raw) : 0
  return Number.isFinite(n) ? n : 0
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`).getTime()
  const db = new Date(`${b}T00:00:00`).getTime()
  return Math.round((db - da) / 86_400_000)
}

function readStreak(): Streak {
  return {
    current: readNumber(STREAK_CURRENT_KEY),
    longest: readNumber(STREAK_LONGEST_KEY),
    lastActiveDate: isBrowser() ? window.localStorage.getItem(LAST_ACTIVE_KEY) : null,
  }
}

/**
 * Registra actividad del día. Idempotente por día: si ya se registró hoy no
 * modifica la racha. Actualiza racha actual/máxima según continuidad.
 */
export function recordDailyActivity(): Streak {
  if (!isBrowser()) return readStreak()

  const today = toISODate(new Date())
  const last = window.localStorage.getItem(LAST_ACTIVE_KEY)
  let current = readNumber(STREAK_CURRENT_KEY)
  let longest = readNumber(STREAK_LONGEST_KEY)

  if (last === today) {
    return { current, longest, lastActiveDate: last }
  }

  if (last) {
    const gap = daysBetween(last, today)
    current = gap === 1 ? current + 1 : 1
  } else {
    current = 1
  }

  longest = Math.max(longest, current)

  window.localStorage.setItem(LAST_ACTIVE_KEY, today)
  window.localStorage.setItem(STREAK_CURRENT_KEY, String(current))
  window.localStorage.setItem(STREAK_LONGEST_KEY, String(longest))

  return { current, longest, lastActiveDate: today }
}

export function getGamificationState(): GamificationState {
  const xp = readNumber(XP_KEY)
  const streak = readStreak()

  return {
    xp,
    level: getLevelByXP(xp),
    streak,
    achievements: [],
    weeklyXP: readNumber(WEEKLY_XP_KEY),
    weeklyGoal: WEEKLY_GOAL,
  }
}
