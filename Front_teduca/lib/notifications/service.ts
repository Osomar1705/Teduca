import { apiClient } from '@/lib/api-client'
import type { Notification, NotificationCategory } from './types'

interface ApiNotification {
  id: string
  type: string
  title: string
  message: string
  read_at: string | null
  created_at: string
}

function toNotification(n: ApiNotification): Notification {
  const categoryMap: Record<string, NotificationCategory> = {
    courses: 'courses',
    mentorship: 'mentorships',
    messages: 'messages',
    achievements: 'achievements',
    system: 'system',
    rewards: 'rewards',
    ai: 'ai',
  }
  return {
    id: n.id,
    category: categoryMap[n.type] ?? 'system',
    title: n.title,
    body: n.message,
    isRead: n.read_at !== null,
    createdAt: n.created_at,
  }
}

export async function getNotifications(): Promise<Notification[]> {
  const data = await apiClient.get<{ data: ApiNotification[] }>('/api/v1/notifications?limit=50')
  return data.data.map(toNotification)
}

export async function markAsRead(id: string): Promise<void> {
  await apiClient.patch(`/api/v1/notifications/${id}/read`)
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch('/api/v1/notifications/read-all')
}
