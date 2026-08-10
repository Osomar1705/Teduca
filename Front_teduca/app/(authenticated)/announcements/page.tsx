'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Pin, Info, Calendar, AlertTriangle, X } from 'lucide-react'

import { getAnnouncements } from '@/lib/announcements/service'
import type { Announcement } from '@/lib/announcements/types'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  info:  { label: 'Información', icon: Info,          color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40'   },
  event: { label: 'Evento',      icon: Calendar,      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
  alert: { label: 'Alerta',      icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
} as const

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── AnnouncementModal ─────────────────────────────────────────────────────────

function AnnouncementModal({ item, onClose }: { item: Announcement; onClose: () => void }) {
  const { icon: TypeIcon, label, color } = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.info

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-background border border-border/60 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-muted/80 p-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {item.image && (
          <div className="relative h-56 w-full bg-muted/40 sm:h-72">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-contain"
              priority
            />
          </div>
        )}

        <div className="flex flex-col gap-3 p-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', color)}>
              <TypeIcon className="size-3" />
              {label}
            </span>
            {item.pinned && (
              <span className="flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Pin className="size-3" />
                Fijado
              </span>
            )}
            <span className="ml-auto text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">{item.title}</h2>
          {item.body && (
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── AnnouncementCard ─────────────────────────────────────────────────────────

function AnnouncementCard({ item, featured, onClick }: { item: Announcement; featured?: boolean; onClick: () => void }) {
  const { icon: TypeIcon, label, color } = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.info

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border border-border/60 bg-card overflow-hidden text-left transition-all duration-200 hover:border-border hover:shadow-sm',
        featured && 'ring-1 ring-primary/20'
      )}
    >
      {featured && item.image && (
        <div className="relative h-48 w-full bg-muted/40 sm:h-64">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-contain"
            priority
          />
        </div>
      )}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', color)}>
            <TypeIcon className="size-3" />
            {label}
          </span>
          {item.pinned && (
            <span className="flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Pin className="size-3" />
              Fijado
            </span>
          )}
          <span className="ml-auto text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
        </div>
        <h2 className={cn('font-bold text-foreground', featured ? 'text-xl' : 'text-base')}>
          {item.title}
        </h2>
        {item.body && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{item.body}</p>
        )}
        {!featured && item.image && (
          <div className="relative mt-1 h-32 w-full overflow-hidden rounded-lg bg-muted/40">
            <Image src={item.image} alt={item.title} fill sizes="600px" className="object-contain" />
          </div>
        )}
        <p className="text-xs font-medium text-primary">Ver más →</p>
      </div>
    </button>
  )
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function FeaturedSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <Skeleton className="h-48 w-full sm:h-64" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

function ItemSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden p-5 flex flex-col gap-3">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Announcement | null>(null)

  useEffect(() => {
    getAnnouncements()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const pinned = items.filter((a) => a.pinned)
  const rest = items.filter((a) => !a.pinned)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Anuncios y Comunicados</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comunicados oficiales y novedades de TEDUCA.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <FeaturedSkeleton />
          <ItemSkeleton />
          <ItemSkeleton />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="font-medium">Aún no hay comunicados disponibles</p>
          <p className="mt-1 text-sm">Cuando haya contenido nuevo aparecerá aquí.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pinned.map((item, i) => (
            <AnnouncementCard key={item.id} item={item} featured={i === 0} onClick={() => setSelected(item)} />
          ))}
          {rest.map((item) => (
            <AnnouncementCard key={item.id} item={item} onClick={() => setSelected(item)} />
          ))}
        </div>
      )}

      {selected && <AnnouncementModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
