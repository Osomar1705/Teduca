'use client'

import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'

import { useState } from 'react'
import { Search, MoreHorizontal, Mail, MessageCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { cn } from '@/lib/utils'

type Filter = 'todos' | 'activos' | 'inactivos' | 'nuevos'

const STUDENTS = [
  { id: '1', name: 'Valeria Torres',  username: 'val_torres', course: 'React & Next.js',      sessions: 12, progress: 78, rating: 5.0, lastSeen: 'Hace 2h',   status: 'activo',  trend: 'up'   },
  { id: '2', name: 'Carlos Mendoza',  username: 'carlos_m',  course: 'Machine Learning',      sessions: 8,  progress: 55, rating: 4.8, lastSeen: 'Hace 1d',   status: 'activo',  trend: 'up'   },
  { id: '3', name: 'Sofía Ramírez',   username: 'sofia_r',   course: 'Estadística con R',     sessions: 5,  progress: 35, rating: 4.5, lastSeen: 'Hace 3d',   status: 'activo',  trend: 'flat' },
  { id: '4', name: 'Diego Ríos',      username: 'diego_rios',course: 'Robótica e IoT',        sessions: 15, progress: 92, rating: 5.0, lastSeen: 'Hace 5h',   status: 'activo',  trend: 'up'   },
  { id: '5', name: 'Andrés Castillo', username: 'andres_c',  course: 'Computer Vision',       sessions: 3,  progress: 15, rating: null, lastSeen: 'Hace 1sem', status: 'nuevo',   trend: 'flat' },
  { id: '6', name: 'Lucía Vargas',    username: 'lucia_v',   course: 'React & Next.js',       sessions: 2,  progress: 10, rating: null, lastSeen: 'Hace 2sem', status: 'inactivo',trend: 'down' },
  { id: '7', name: 'Miguel Sánchez',  username: 'miguel_s',  course: 'Machine Learning',      sessions: 6,  progress: 42, rating: 4.6, lastSeen: 'Hace 4h',   status: 'activo',  trend: 'up'   },
  { id: '8', name: 'Andrea López',    username: 'andrea_l',  course: 'Estadística con R',     sessions: 4,  progress: 28, rating: 4.9, lastSeen: 'Hace 6h',   status: 'activo',  trend: 'up'   },
]

const STATUS_STYLE: Record<string, string> = {
  activo:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  inactivo: 'bg-muted text-muted-foreground',
  nuevo:    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'up')   return <TrendingUp   className="size-3 text-emerald-500" />
  if (trend === 'down') return <TrendingDown className="size-3 text-rose-500" />
  return <Minus className="size-3 text-muted-foreground" />
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all', value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-primary')}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[11px] text-muted-foreground">{value}%</span>
    </div>
  )
}

export default function StudentsPage() {
  const { isAllowed } = useTeacherGuard()
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<Filter>('todos')

  const filtered = STUDENTS.filter((s) => {
    const matchFilter = filter === 'todos' || s.status === filter.replace('activos','activo').replace('inactivos','inactivo').replace('nuevos','nuevo')
    const q = search.toLowerCase()
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.course.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  if (!isAllowed) return null
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Alumnos</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{STUDENTS.length} alumnos en total</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Mail className="size-3.5" /> Mensaje grupal
          </button>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar alumno o curso..."
              className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="flex gap-1.5">
            {(['todos','activos','nuevos','inactivos'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  filter === f
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="hidden grid-cols-[1fr_160px_80px_100px_80px_40px] items-center gap-4 border-b border-border/60 px-5 py-2.5 sm:grid">
          {['Alumno', 'Curso', 'Sesiones', 'Progreso', 'Estado', ''].map((h) => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</span>
          ))}
        </div>
        <Stagger className="divide-y divide-border/60">
          {filtered.map((s) => (
            <StaggerItem key={s.id}>
              <div className="group flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-muted/20 sm:grid sm:grid-cols-[1fr_160px_80px_100px_80px_40px] sm:items-center sm:gap-4">
                {/* Alumno */}
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {s.name.split(' ').map((n) => n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span>@{s.username}</span>
                      <span>·</span>
                      <span>{s.lastSeen}</span>
                    </div>
                  </div>
                </div>
                {/* Curso */}
                <p className="truncate text-xs text-muted-foreground">{s.course}</p>
                {/* Sesiones */}
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">{s.sessions}</span>
                  <TrendIcon trend={s.trend} />
                </div>
                {/* Progreso */}
                <ProgressBar value={s.progress} />
                {/* Estado */}
                <span className={cn('inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-medium capitalize', STATUS_STYLE[s.status])}>
                  {s.status}
                </span>
                {/* Acciones */}
                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-xl p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <MessageCircle className="size-3.5" />
                  </button>
                  <button className="rounded-xl p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-foreground">Sin resultados</p>
            <p className="text-xs text-muted-foreground">Prueba con otro filtro o búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
