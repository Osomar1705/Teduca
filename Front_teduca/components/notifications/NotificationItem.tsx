'use client'

import Link from 'next/link'
import {
  BookOpen,
  GraduationCap,
  MessageCircle,
  Calendar,
  Settings,
  Trophy,
  Gift,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Notification, NotificationCategory } from '@/lib/notifications/types'

const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  courses: BookOpen,
  mentorships: GraduationCap,
  messages: MessageCircle,
  events: Calendar,
  system: Settings,
  achievements: Trophy,
  rewards: Gift,
  ai: Sparkles,
}

export function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
}) {
  const Icon = CATEGORY_ICON[notification.category]

  const inner = (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-muted',
        !notification.isRead && 'bg-primary/[0.03]'
      )}
    >
      <div className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">{notification.title}</p>
          {!notification.isRead && (
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{notification.body}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  )

  const handleClick = () => {
    if (!notification.isRead) onMarkRead(notification.id)
  }

  if (notification.href) {
    return (
      <Link href={notification.href} onClick={handleClick} className="block">
        {inner}
      </Link>
    )
  }

  return (
    <button type="button" onClick={handleClick} className="block w-full text-left">
      {inner}
    </button>
  )
}
