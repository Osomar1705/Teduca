import type { MentorMemory } from './types'

const MEMORY_KEY = 'teduca_mentor_memory'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

const DEFAULT_MEMORY: MentorMemory = {
  chatHistory: [],
  weeklyGoalCompleted: false,
  lastSeen: null,
  notes: [],
}

export function loadMemory(): MentorMemory {
  if (!isBrowser()) return { ...DEFAULT_MEMORY }
  try {
    const raw = window.localStorage.getItem(MEMORY_KEY)
    if (!raw) return { ...DEFAULT_MEMORY }
    return JSON.parse(raw) as MentorMemory
  } catch {
    return { ...DEFAULT_MEMORY }
  }
}

export function saveMemory(memory: MentorMemory): void {
  if (!isBrowser()) return
  try {
    // Keep only last 50 messages to avoid unbounded growth
    const trimmed: MentorMemory = {
      ...memory,
      chatHistory: memory.chatHistory.slice(-50),
    }
    window.localStorage.setItem(MEMORY_KEY, JSON.stringify(trimmed))
  } catch {
    // silently ignore quota errors
  }
}

export function clearMemory(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(MEMORY_KEY)
}
