export type NotificationCategory =
  | 'courses'
  | 'mentorships'
  | 'messages'
  | 'events'
  | 'system'
  | 'achievements'
  | 'rewards'
  | 'ai'

export interface Notification {
  id: string
  category: NotificationCategory
  title: string
  body: string
  isRead: boolean
  createdAt: string
  href?: string
  icon?: string
}
