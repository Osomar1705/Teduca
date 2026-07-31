'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarCheck, Clock, Video, MapPin, Compass } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Stagger, StaggerItem } from '@/components/common/Motion'
import { getReservations, cancelReservation } from '@/lib/edtech/service'
import { formatPrice, formatDate, MODALITY_LABEL } from '@/lib/format'
import { APP_ROUTES } from '@/lib/constants'
import type { Reservation, ReservationStatus } from '@/lib/edtech/types'

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
        <p className="text-muted-foreground">Cargando...</p>
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
                <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
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
                </Card>
              </StaggerItem>
            )
          })}
        </Stagger>
      )}
    </div>
  )
}
