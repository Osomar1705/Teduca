'use client'

import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'
import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Clock, User, Video, MapPin, Check, X, Loader2, Link } from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  getTeacherReservations,
  confirmReservation,
  completeReservation,
  cancelReservationAsTeacher,
} from '@/lib/edtech/service'
import type { Reservation, ReservationStatus } from '@/lib/edtech/types'
import { APP_ROUTES } from '@/lib/constants'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const STATUS_BADGE: Record<ReservationStatus, { label: string; variant: 'warning' | 'success' | 'info' | 'secondary' }> = {
  pending:   { label: 'Pendiente',   variant: 'warning' },
  confirmed: { label: 'Confirmada',  variant: 'success' },
  completed: { label: 'Completada',  variant: 'info' },
  cancelled: { label: 'Cancelada',   variant: 'secondary' },
}

function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const days: (number | null)[] = Array(offset).fill(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  while (days.length % 7 !== 0) days.push(null)
  return days
}

export default function TeacherCalendarPage() {
  const { isAllowed } = useTeacherGuard()
  const today = new Date()
  const [year, setYear]         = useState(today.getFullYear())
  const [month, setMonth]       = useState(today.getMonth())
  const [selected, setSelected] = useState<number | null>(today.getDate())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading]   = useState(true)
  const [acting, setActing]     = useState<string | null>(null)

  const load = useCallback(() => {
    if (!isAllowed) return
    setLoading(true)
    getTeacherReservations()
      .then(setReservations)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAllowed])

  useEffect(() => { load() }, [load])

  const calendar = buildCalendar(year, month)

  const sessionsForDay = reservations.filter((r) => {
    if (!r.date) return false
    const [y, m, d] = r.date.split('-').map(Number)
    return y === year && m - 1 === month && d === selected
  })

  const daysWithSessions = new Set(
    reservations
      .filter((r) => {
        if (!r.date) return false
        const [y, m] = r.date.split('-').map(Number)
        return y === year && m - 1 === month
      })
      .map((r) => Number(r.date.split('-')[2]))
  )

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  async function handleAction(action: 'confirm' | 'complete' | 'cancel', id: string) {
    setActing(id + action)
    try {
      let updated: Reservation
      if (action === 'confirm') updated = await confirmReservation(id)
      else if (action === 'complete') updated = await completeReservation(id)
      else updated = await cancelReservationAsTeacher(id)
      setReservations(prev => prev.map(r => r.id === id ? updated : r))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al actualizar la reserva.')
    } finally {
      setActing(null)
    }
  }

  if (!isAllowed) return null

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Agenda</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Gestiona tus reservas y sesiones</p>
          </div>
          <a
            href={APP_ROUTES.TEACHER_PROFILE}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Link className="size-3.5" /> Editar disponibilidad
          </a>
        </div>
      </FadeIn>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Calendario */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <button onClick={prevMonth} className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <ChevronLeft className="size-4" />
              </button>
              <h2 className="text-sm font-semibold text-foreground">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 text-center">
              {DAYS.map((d) => (
                <div key={d} className="py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {calendar.map((day, i) => {
                if (!day) return <div key={i} />
                const hasSession = daysWithSessions.has(day)
                const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                const isSel      = day === selected
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(day)}
                    className={cn(
                      'relative flex aspect-square items-center justify-center rounded-xl text-sm transition-all',
                      isSel
                        ? 'bg-primary font-semibold text-primary-foreground shadow-xs'
                        : isToday
                          ? 'border border-primary/50 font-semibold text-primary'
                          : 'text-foreground hover:bg-muted'
                    )}
                  >
                    {day}
                    {hasSession && !isSel && (
                      <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sesiones del día */}
          {selected && (
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border/60 px-5 py-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {loading
                    ? 'Cargando…'
                    : sessionsForDay.length > 0
                      ? `${sessionsForDay.length} reserva${sessionsForDay.length > 1 ? 's' : ''} · ${MONTHS[month]} ${selected}`
                      : `Sin reservas · ${MONTHS[month]} ${selected}`}
                </h3>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : sessionsForDay.length > 0 ? (
                <Stagger className="divide-y divide-border/60">
                  {sessionsForDay.map((r) => {
                    const s = STATUS_BADGE[r.status]
                    const busy = acting !== null
                    return (
                      <StaggerItem key={r.id}>
                        <div className="flex flex-col gap-3 px-5 py-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground">{r.teacherName}</p>
                                <Badge variant={s.variant}>{s.label}</Badge>
                              </div>
                              {r.courseTitle && (
                                <p className="text-xs text-muted-foreground">{r.courseTitle}</p>
                              )}
                              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3" />{r.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  {r.modality === 'virtual'
                                    ? <Video className="size-3" />
                                    : <MapPin className="size-3" />}
                                  {r.modality === 'virtual' ? 'Virtual' : 'Presencial'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Acciones del profesor */}
                          {r.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction('confirm', r.id)}
                                disabled={busy}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-400"
                              >
                                {acting === r.id + 'confirm' ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                                Confirmar
                              </button>
                              <button
                                onClick={() => handleAction('cancel', r.id)}
                                disabled={busy}
                                className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                              >
                                {acting === r.id + 'cancel' ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
                                Rechazar
                              </button>
                            </div>
                          )}
                          {r.status === 'confirmed' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction('complete', r.id)}
                                disabled={busy}
                                className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                              >
                                {acting === r.id + 'complete' ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                                Marcar completada
                              </button>
                              <button
                                onClick={() => handleAction('cancel', r.id)}
                                disabled={busy}
                                className="flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-50"
                              >
                                {acting === r.id + 'cancel' ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />}
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </StaggerItem>
                    )
                  })}
                </Stagger>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-muted-foreground">Sin reservas para este día</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna derecha */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Resumen del mes</h3>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Pendientes</span>
                  <span className="font-medium text-foreground">
                    {reservations.filter(r => {
                      const [y, m] = r.date.split('-').map(Number)
                      return r.status === 'pending' && y === year && m - 1 === month
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Confirmadas</span>
                  <span className="font-medium text-foreground">
                    {reservations.filter(r => {
                      const [y, m] = r.date.split('-').map(Number)
                      return r.status === 'confirmed' && y === year && m - 1 === month
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Completadas</span>
                  <span className="font-medium text-foreground">
                    {reservations.filter(r => {
                      const [y, m] = r.date.split('-').map(Number)
                      return r.status === 'completed' && y === year && m - 1 === month
                    }).length}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-1.5 text-sm font-semibold text-foreground">Disponibilidad</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Define tus horarios disponibles desde tu perfil de profesor para que los alumnos puedan reservar.
            </p>
            <a
              href={APP_ROUTES.TEACHER_PROFILE}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              Editar disponibilidad
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
