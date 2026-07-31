/**
 * Capa de servicio del dominio EdTech.
 *
 * Firma pensada para ser idéntica cuando se cablee el backend FastAPI:
 * funciones async que devuelven Promesas. Hoy resuelven contra el mock y
 * persisten los favoritos en localStorage para dar sensación de sesión real.
 */

import {
  mockCourses,
  mockCurrentUser,
  mockReservations,
  mockTeachers,
} from './mock'
import type {
  Course,
  CurrentUser,
  Reservation,
  SwipeDirection,
  SwipeResult,
  TeacherProfile,
} from './types'

const FAV_KEY = 'teduca_favorites'
const SEEN_KEY = 'teduca_seen_teachers'

const delay = <T>(value: T, ms = 260): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

function readSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    return new Set(JSON.parse(window.localStorage.getItem(key) ?? '[]'))
  } catch {
    return new Set()
  }
}

function writeSet(key: string, set: Set<string>): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify([...set]))
}

// --- Usuario -------------------------------------------------------------
export async function getCurrentUser(): Promise<CurrentUser> {
  return delay(mockCurrentUser, 120)
}

// --- Profesores ----------------------------------------------------------
export async function getTeachers(): Promise<TeacherProfile[]> {
  return delay(mockTeachers)
}

export async function getTeacher(id: string): Promise<TeacherProfile | null> {
  return delay(mockTeachers.find((t) => t.id === id) ?? null)
}

// --- Cursos --------------------------------------------------------------
export async function getCourses(): Promise<Course[]> {
  return delay(mockCourses)
}

export async function getCourse(id: string): Promise<Course | null> {
  return delay(mockCourses.find((c) => c.id === id) ?? null)
}

export async function getCoursesByTeacher(
  teacherId: string
): Promise<Course[]> {
  return delay(mockCourses.filter((c) => c.teacherId === teacherId))
}

// --- Descubrir (deck para swipe) ----------------------------------------
export async function getDiscoverDeck(): Promise<TeacherProfile[]> {
  const seen = readSet(SEEN_KEY)
  const deck = mockTeachers.filter((t) => !seen.has(t.id))
  return delay(deck.length ? deck : mockTeachers, 200)
}

export async function swipeTeacher(
  teacherId: string,
  direction: SwipeDirection
): Promise<SwipeResult> {
  const teacher = mockTeachers.find((t) => t.id === teacherId)!
  const seen = readSet(SEEN_KEY)
  seen.add(teacherId)
  writeSet(SEEN_KEY, seen)

  let matched = false
  if (direction === 'right') {
    const favs = readSet(FAV_KEY)
    favs.add(teacherId)
    writeSet(FAV_KEY, favs)
    matched = true
  }
  return delay({ matched, teacher }, 80)
}

export async function resetDeck(): Promise<void> {
  writeSet(SEEN_KEY, new Set())
  return delay(undefined, 60)
}

// --- Favoritos -----------------------------------------------------------
export async function getFavorites(): Promise<TeacherProfile[]> {
  const favs = readSet(FAV_KEY)
  return delay(mockTeachers.filter((t) => favs.has(t.id)))
}

export async function isFavorite(teacherId: string): Promise<boolean> {
  return delay(readSet(FAV_KEY).has(teacherId), 40)
}

export async function toggleFavorite(teacherId: string): Promise<boolean> {
  const favs = readSet(FAV_KEY)
  const now = !favs.has(teacherId)
  if (now) favs.add(teacherId)
  else favs.delete(teacherId)
  writeSet(FAV_KEY, favs)
  return delay(now, 60)
}

// --- Reservas ------------------------------------------------------------
let reservations: Reservation[] = [...mockReservations]

export async function getReservations(): Promise<Reservation[]> {
  return delay([...reservations])
}

export async function createReservation(
  input: Omit<Reservation, 'id' | 'status' | 'createdAt'>
): Promise<Reservation> {
  const reservation: Reservation = {
    ...input,
    id: `r${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  reservations = [reservation, ...reservations]
  return delay(reservation, 200)
}

export async function cancelReservation(id: string): Promise<void> {
  reservations = reservations.map((r) =>
    r.id === id ? { ...r, status: 'cancelled' } : r
  )
  return delay(undefined, 120)
}
