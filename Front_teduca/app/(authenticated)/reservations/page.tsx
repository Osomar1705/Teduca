'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarCheck, Clock, Video, MapPin, Compass,
  FileText, FileImage, Link2, ExternalLink, ChevronDown, ChevronRight, Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Stagger, StaggerItem } from '@/components/common/Motion'
import { Skeleton } from '@/components/ui/skeleton'
import { getReservations, cancelReservation } from '@/lib/edtech/service'
import { getCourseMaterials } from '@/lib/materials/service'
import { formatPrice, formatDate, MODALITY_LABEL } from '@/lib/format'
import { APP_ROUTES } from '@/lib/constants'
import type { Reservation, ReservationStatus } from '@/lib/edtech/types'
import type { CourseMaterial, MaterialType } from '@/lib/materials/types'

const MATERIAL_ICON: Record<MaterialType, React.ReactNode> = {
  video: <Video className="size-4 text-blue-500" />,
  pdf: <FileText className="size-4 text-red-500" />,
  document: <FileText className="size-4 text-indigo-500" />,
  presentation: <FileImage className="size-4 text-orange-500" />,
  link: <Link2 className="size-4 text-emerald-500" />,
  other: <FileText className="size-4 text-muted-foreground" />,
}

function ReservationMaterials({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [error, setError] = useState('')

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next && !loaded) {
      setLoading(true)
      setError('')
      try {
        setMaterials(await getCourseMaterials(courseId))
        setLoaded(true)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudieron cargar los materiales.')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="flex items-center gap-1.5">
          <FileText className="size-3.5" /> Materiales del curso
        </span>
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </button>

      {open && (
        <div className="mt-2">
          {loading ? (
            <div className="flex items-center gap-2 px-1 py-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Cargando materiales…
            </div>
          ) : error ? (
            <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{error}</p>
          ) : materials.length === 0 ? (
            <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              El profesor aún no ha compartido materiales para este curso.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {materials.map((m) => (
                <li key={m.id} className="flex items-center gap-2 bg-muted/20 px-3 py-2">
                  {MATERIAL_ICON[m.materialType]}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{m.title}</p>
                    {m.description && (
                      <p className="truncate text-[11px] text-muted-foreground">{m.description}</p>
                    )}
                  </div>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Abrir ${m.title}`}
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

const STATUS: Record<
  ReservationStatus,
  { label: string; variant: 'success' | 'info' | 'warning' | 'destructive' | 'secondary' }
> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  confirmed: { label: 'Confirmada', variant: 'success' },
  completed: { label: 'Completada', variant: 'info' },
  cancelled: { label: 'Cancelada', variant: 'secondary' },
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReservations().then((r) => {
      setReservations(r)
      setLoading(false)
    })
  }, [])

  async function handleCancel(id: string) {
    await cancelReservation(id)
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Mis reservas"
        description="Gestioná tus clases reservadas con profesores."
      />

      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : reservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarCheck className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">
            No tenés reservas todavía
          </p>
          <Button variant="brand" asChild className="mt-5">
            <Link href={APP_ROUTES.DISCOVER}>
              <Compass className="size-4" />
              Buscar un profesor
            </Link>
          </Button>
        </div>
      ) : (
        <Stagger className="flex flex-col gap-4">
          {reservations.map((r) => {
            const status = STATUS[r.status]
            const canCancel = r.status === 'pending' || r.status === 'confirmed'
            return (
              <StaggerItem key={r.id}>
                <Card className="p-5">
                 <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.teacherAvatar}
                    alt={r.teacherName}
                    className="size-14 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-foreground">
                        {r.teacherName}
                      </h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    {r.courseTitle && (
                      <p className="truncate text-sm text-muted-foreground">
                        {r.courseTitle}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarCheck className="size-3.5" />
                        {formatDate(r.date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {r.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {r.modality === 'in-person' ? (
                          <MapPin className="size-3.5" />
                        ) : (
                          <Video className="size-3.5" />
                        )}
                        {MODALITY_LABEL[r.modality]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <p className="font-bold text-foreground">
                      {formatPrice(r.price, r.currency)}
                    </p>
                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleCancel(r.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                 </div>
                 {r.courseId && r.status !== 'cancelled' && (
                   <ReservationMaterials courseId={r.courseId} />
                 )}
                </Card>
              </StaggerItem>
            )
          })}
        </Stagger>
      )}
    </div>
  )
}
