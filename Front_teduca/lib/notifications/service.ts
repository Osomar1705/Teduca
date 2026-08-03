import type { Notification } from './types'
import { getChatThreads } from '../edtech/service'

/**
 * Centro de notificaciones. Combina señales reales del backend (hilos de chat
 * recientes) con notificaciones de sistema/placeholder.
 * El estado "leído" persiste en localStorage para sobrevivir recargas.
 * Migrará a `/api/v1/notifications` cuando el backend lo exponga.
 */

const READ_KEY = 'teduca_read_notifications'
const ALL_READ_KEY = 'teduca_all_notifications_read'

function isBrowser() {
  return typeof window !== 'undefined'
}

function getReadSet(): Set<string> {
  if (!isBrowser()) return new Set()
  try {
    const raw = localStorage.getItem(READ_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveReadSet(ids: Set<string>) {
  if (!isBrowser()) return
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]))
}

function isAllRead(): boolean {
  if (!isBrowser()) return false
  return localStorage.getItem(ALL_READ_KEY) === '1'
}

function setAllRead(val: boolean) {
  if (!isBrowser()) return
  if (val) localStorage.setItem(ALL_READ_KEY, '1')
  else localStorage.removeItem(ALL_READ_KEY)
}

function base(): Notification[] {
  const now = Date.now()
  return [
    {
      id: 'sys-welcome',
      category: 'system',
      title: 'Bienvenido a TEDUCA',
      body: 'Completá tu perfil académico para recibir recomendaciones personalizadas.',
      isRead: false,
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
      href: '/profile',
    },
    {
      id: 'ach-first-steps',
      category: 'achievements',
      title: 'Nuevo logro disponible',
      body: 'Completá tu primer curso para desbloquear "Primer Paso".',
      isRead: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      href: '/achievements',
    },
    {
      id: 'ai-mentor',
      category: 'ai',
      title: 'Tu mentor académico te espera',
      body: 'Pedile ayuda para organizar tu semana de estudio.',
      isRead: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      href: '/for-you',
    },
    {
      id: 'course-recommend',
      category: 'courses',
      title: 'Cursos recomendados para vos',
      body: 'Encontramos cursos que coinciden con tus intereses.',
      isRead: true,
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      href: '/courses',
    },
  ]
}

export async function getNotifications(): Promise<Notification[]> {
  const items = base()

  try {
    const threads = await getChatThreads()
    threads.slice(0, 3).forEach((t) => {
      items.push({
        id: `msg-${t.id}`,
        category: 'messages',
        title: `Conversación con ${t.teacherName}`,
        body: 'Tenés una conversación activa. Continuá el chat.',
        isRead: false,
        createdAt: t.updatedAt,
        href: '/messages',
      })
    })
  } catch {
    // Sin sesión de chat activa: se omiten notificaciones de mensajes.
  }

  const readIds = getReadSet()
  const allDone = isAllRead()

  return items
    .map((n) => ({
      ...n,
      isRead: allDone || readIds.has(n.id) || n.isRead,
    }))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export async function markAsRead(id: string): Promise<void> {
  const ids = getReadSet()
  ids.add(id)
  saveReadSet(ids)
}

export async function markAllAsRead(): Promise<void> {
  setAllRead(true)
}
