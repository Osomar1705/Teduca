import type { Notification } from './types'
import { getChatThreads } from '../edtech/service'

/**
 * Centro de notificaciones. Combina señales reales del backend (hilos de chat
 * recientes) con notificaciones de sistema/placeholder. La persistencia de
 * "leído" es en memoria por ahora; migrará a `/api/v1/notifications`.
 */

let overrides: Record<string, boolean> = {}
let allRead = false

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
    // Sin sesión de chat: se omiten las notificaciones de mensajes.
  }

  return items
    .map((n) => ({
      ...n,
      isRead: allRead || overrides[n.id] || n.isRead,
    }))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export async function markAsRead(id: string): Promise<void> {
  overrides[id] = true
}

export async function markAllAsRead(): Promise<void> {
  allRead = true
  overrides = {}
}
