'use client'

import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, User, Video, MapPin } from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { cn } from '@/lib/utils'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// Genera días del mes (mock: febrero 2025)
function buildCalendar(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const days: (number | null)[] = Array(offset).fill(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  while (days.length % 7 !== 0) days.push(null)
  return days
}

const SESSIONS = [
  { id: '1', day: 5,  time: '4:00 PM',  student: 'Valeria Torres',  subject: 'React Avanzado',     mode: 'virtual',    duration: 60 },
  { id: '2', day: 5,  time: '6:30 PM',  student: 'Carlos Mendoza',  subject: 'Machine Learning',   mode: 'virtual',    duration: 60 },
  { id: '3', day: 6,  time: '9:00 AM',  student: 'Sofía Ramírez',   subject: 'Estadística con R',  mode: 'presencial', duration: 90 },
  { id: '4', day: 6,  time: '11:00 AM', student: 'Diego Ríos',      subject: 'Robótica e IoT',     mode: 'virtual',    duration: 60 },
  { id: '5', day: 10, time: '3:00 PM',  student: 'Andrés Castillo', subject: 'Computer Vision',    mode: 'virtual',    duration: 60 },
  { id: '6', day: 12, time: '5:00 PM',  student: 'Valeria Torres',  subject: 'React Avanzado',     mode: 'virtual',    duration: 60 },
  { id: '7', day: 14, time: '10:00 AM', student: 'Miguel Sánchez',  subject: 'Machine Learning',   mode: 'presencial', duration: 90 },
]

const AVAILABILITY = [
  { day: 'Lunes',    slots: ['9:00 AM', '11:00 AM', '4:00 PM', '6:00 PM'] },
  { day: 'Martes',   slots: ['10:00 AM', '2:00 PM'] },
  { day: 'Miércoles',slots: ['9:00 AM', '4:00 PM', '6:00 PM'] },
  { day: 'Jueves',   slots: ['11:00 AM', '3:00 PM', '6:00 PM'] },
  { day: 'Viernes',  slots: ['9:00 AM', '2:00 PM'] },
]

export default function TeacherCalendarPage() {
  const today = new Date()
  const [year, setYear]     = useState(today.getFullYear())
  const [month, setMonth]   = useState(today.getMonth())
  const [selected, setSelected] = useState<number | null>(today.getDate())

  const calendar = buildCalendar(year, month)
  const sessionsForDay = SESSIONS.filter((s) => s.day === selected)

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Agenda</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Gestiona tu disponibilidad y sesiones</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
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
              <button onClick={prevMonth} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <ChevronLeft className="size-4" />
              </button>
              <h2 className="text-sm font-semibold text-foreground">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
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
                const hasSession = SESSIONS.some((s) => s.day === day && month === today.getMonth())
                const isToday    = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                const isSel      = day === selected
                return (
                  <button
                    key={i}
                    onClick={() => setSelected(day)}
                    className={cn(
                      'relative flex aspect-square items-center justify-center rounded-lg text-sm transition-colors',
                      isSel
                        ? 'bg-primary text-primary-foreground font-semibold'
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
                  {sessionsForDay.map((s) => (
                    <StaggerItem key={s.id}>
                      <div className="flex items-center gap-3 px-5 py-3.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                          <Clock className="size-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{s.time}</p>
                            <span className="text-xs text-muted-foreground">({s.duration} min)</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{s.subject}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="size-3" />{s.student.split(' ')[0]}
                          </div>
                          <span className={cn(
                            'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
                            s.mode === 'virtual' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          )}>
                            {s.mode === 'virtual' ? <Video className="size-2.5" /> : <MapPin className="size-2.5" />}
                            {s.mode}
                          </span>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-muted-foreground">Día libre</p>
                  <button className="mt-3 flex items-center gap-1.5 rounded-lg bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/12 transition-colors">
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
            <div className="space-y-3">
              {AVAILABILITY.map((a) => (
                <div key={a.day}>
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">{a.day}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {a.slots.map((slot) => (
                      <span key={slot} className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
              Editar disponibilidad
            </button>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-1.5 text-sm font-semibold text-foreground">Google Calendar</h3>
            <p className="mb-3 text-xs text-muted-foreground">Sincroniza tu agenda con Google Calendar para gestionar todo desde un solo lugar.</p>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
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
