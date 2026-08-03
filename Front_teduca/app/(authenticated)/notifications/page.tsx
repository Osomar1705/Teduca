'use client'

import { useEffect, useMemo, useState } from 'react'
import { BellOff, CheckCheck } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import { FadeIn } from '@/components/common/Motion'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from '@/lib/notifications/service'
import { cn } from '@/lib/utils'
import type { Notification, NotificationCategory } from '@/lib/notifications/types'

type Tab = 'all' | NotificationCategory

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'courses', label: 'Cursos' },
  { key: 'mentorships', label: 'Mentorías' },
  { key: 'messages', label: 'Mensajes' },
  { key: 'achievements', label: 'Logros' },
  { key: 'system', label: 'Sistema' },
]

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('all')

  useEffect(() => {
    getNotifications()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    items.forEach((n) => {
      if (!n.isRead) map[n.category] = (map[n.category] ?? 0) + 1
    })
    return map
  }, [items])

  const unreadTotal = useMemo(() => items.filter((n) => !n.isRead).length, [items])

  const filtered = useMemo(
    () => (tab === 'all' ? items : items.filter((n) => n.category === tab)),
    [items, tab]
  )

  async function handleMarkRead(id: string) {
    await markAsRead(id)
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  async function handleMarkAll() {
    await markAllAsRead()
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notificaciones"
        description="Todo lo que pasa en tu experiencia académica, en un solo lugar."
        actions={
          <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={unreadTotal === 0}>
            <CheckCheck className="size-4" />
            Marcar todas como leídas
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {t.label}
            {t.key !== 'all' && counts[t.key] ? (
              <span
                className={cn(
                  'inline-flex min-w-4 items-center justify-center rounded-full px-1 text-xs',
                  tab === t.key ? 'bg-white/20' : 'bg-primary/10 text-primary'
                )}
              >
                {counts[t.key]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Sin notificaciones"
          description="No tenés notificaciones en esta categoría por ahora."
        />
      ) : (
        <FadeIn>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {filtered.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
            ))}
          </div>
        </FadeIn>
      )}
    </div>
  )
}
