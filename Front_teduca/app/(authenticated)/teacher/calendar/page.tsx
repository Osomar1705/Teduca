'use client'

import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, User, Video, MapPin } from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { cn } from '@/lib/utils'
import { getReservations } from '@/lib/edtech/service'
import type { Reservation } from '@/lib/edtech/types'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

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
  const [year, setYear]     = useState(today.getFullYear())
  const [month, setMonth]   = useState(today.getMonth())
  const [selected, setSelected] = useState<number | null>(today.getDate())
  const [reservations, setReservations] = useState<Reservation[]>([])

  useEffect(() => {
    if (!isAllowed) return
    getReservations().then(setReservations).catch(() => {})
  }, [isAllowed])

  const calendar = buildCalendar(year, month)

  // Filtra reservas del mes/año actual y del día seleccionado
  const sessionsForDay = reservations.filter((r) => {
    if (!r.date) return false
    const d = new Date(r.date)
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selected
  })

  // Días del mes actual con reservas (para marcar en el calendario)
  const daysWithSessions = new Set(
    reservations
      .filter((r) => {
        if (!r.date) return false
        const d = new Date(r.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map((r) => new Date(r.date).getDate())
  )

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  if (!isAllowed) return null
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Agenda</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Gestiona tu disponibilidad y sesiones</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="size-3.5" /> Nueva sesión
          </button>
        </div>
      </FadeIn>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Columna izquierda */}
        <div className="space-y-4">
          {/* Calendario */}
          <div className="rounded-xl border border-border bg-card p-4">
            {/* Header mes */}
            <div className="mb-4 flex items-center justify-between">
              <button onClick={prevMonth} className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <ChevronLeft className="size-4" />
              </button>
              <h2 className="text-sm font-semibold text-foreground">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Días de semana */}
            <div className="mb-1 grid grid-cols-7 text-center">
              {DAYS.map((d) => (
                <div key={d} className="py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{d}</div>
              ))}
            </div>

            {/* Días */}
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

          {/* Sesiones del día seleccionado */}
          {selected && (
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border/60 px-5 py-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {sessionsForDay.length > 0
                    ? `${sessionsForDay.length} sesión${sessionsForDay.length > 1 ? 'es' : ''} · día ${selected}`
                    : `Sin sesiones · día ${selected}`}
                </h3>
              </div>
              {sessionsForDay.length > 0 ? (
                <Stagger className="divide-y divide-border/60">
                  {sessionsForDay.map((r) => (
                    <StaggerItem key={r.id}>
                      <div className="flex items-center gap-3 px-5 py-3.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/8">
                          <Clock className="size-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{r.time}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{r.courseTitle ?? r.modality}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="size-3" />{r.teacherName.split(' ')[0]}
                          </div>
                          <span className={cn(
                            'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
                            r.modality === 'virtual' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          )}>
                            {r.modality === 'virtual' ? <Video className="size-2.5" /> : <MapPin className="size-2.5" />}
                            {r.modality}
                          </span>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-muted-foreground">Día libre</p>
                  <button className="mt-3 flex items-center gap-1.5 rounded-xl bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/12">
                    <Plus className="size-3.5" /> Agendar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna derecha: disponibilidad */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Mi disponibilidad</h3>
            <p className="text-xs text-muted-foreground">
              Configura tu disponibilidad desde tu perfil de profesor.
            </p>
            <button className="mt-4 w-full rounded-xl border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
              Editar disponibilidad
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-1.5 text-sm font-semibold text-foreground">Google Calendar</h3>
            <p className="mb-3 text-xs text-muted-foreground">Sincroniza tu agenda con Google Calendar para gestionar todo desde un solo lugar.</p>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://www.google.com/favicon.ico" alt="" className="size-3.5" />
              Conectar Google Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
