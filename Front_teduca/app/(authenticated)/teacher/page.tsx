'use client'

import { motion } from 'framer-motion'
import {
  Users, BookOpen, DollarSign, Star, TrendingUp,
  Clock, CalendarCheck, ArrowUpRight, MoreHorizontal,
  ChevronRight, Zap,
} from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { cn } from '@/lib/utils'

// ── Mock data ──────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Alumnos activos',     value: '124',   delta: '+8 este mes',  icon: Users,        color: 'text-blue-500',   bg: 'bg-blue-500/8'   },
  { label: 'Horas enseñadas',     value: '86 h',  delta: '+12 esta sem', icon: Clock,        color: 'text-violet-500', bg: 'bg-violet-500/8' },
  { label: 'Ganancias del mes',   value: 'S/ 3,200', delta: '+18%',      icon: DollarSign,   color: 'text-emerald-500',bg: 'bg-emerald-500/8'},
  { label: 'Calificación',        value: '4.9',   delta: '142 reseñas',  icon: Star,         color: 'text-amber-500',  bg: 'bg-amber-500/8'  },
]

const UPCOMING_SESSIONS = [
  { id: '1', student: 'Valeria Torres',   subject: 'React Avanzado',      time: 'Hoy, 4:00 PM',     avatar: 'VT', status: 'confirmed' },
  { id: '2', student: 'Carlos Mendoza',   subject: 'Machine Learning',    time: 'Hoy, 6:30 PM',     avatar: 'CM', status: 'confirmed' },
  { id: '3', student: 'Sofía Ramírez',    subject: 'Estadística con R',   time: 'Mañana, 9:00 AM',  avatar: 'SR', status: 'pending'   },
  { id: '4', student: 'Diego Ríos',       subject: 'Robótica e IoT',      time: 'Mañana, 11:00 AM', avatar: 'DR', status: 'confirmed' },
  { id: '5', student: 'Andrés Castillo',  subject: 'Computer Vision',     time: 'Jue, 3:00 PM',     avatar: 'AC', status: 'confirmed' },
]

const MY_COURSES = [
  { id: '1', title: 'React & Next.js para todos',  students: 48, rating: 4.9, revenue: 'S/ 1,440', status: 'published' },
  { id: '2', title: 'Machine Learning con Python', students: 36, rating: 4.8, revenue: 'S/ 1,080', status: 'published' },
  { id: '3', title: 'Robótica e IoT con Arduino',  students: 12, rating: 4.7, revenue: 'S/ 360',   status: 'draft'     },
]

const RECENT_REVIEWS = [
  { id: '1', author: 'Valeria T.', rating: 5, text: 'Excelente profesor, muy didáctico y siempre dispuesto a ayudar.', course: 'React & Next.js', ago: 'hace 2h' },
  { id: '2', author: 'Carlos M.',  rating: 5, text: 'Las clases de ML son increíbles. Aprendo muchísimo cada sesión.', course: 'Machine Learning', ago: 'hace 1d' },
]

const MONTHLY_INCOME = [
  { month: 'Sep', amount: 1800 },
  { month: 'Oct', amount: 2100 },
  { month: 'Nov', amount: 2600 },
  { month: 'Dic', amount: 2800 },
  { month: 'Ene', amount: 3100 },
  { month: 'Feb', amount: 3200 },
]
const MAX_INCOME = Math.max(...MONTHLY_INCOME.map((m) => m.amount))

// ── Componentes ────────────────────────────────────────────────────────────

function Avatar2({ initials, size = 'sm' }: { initials: string; size?: 'sm' | 'md' }) {
  return (
    <div className={cn(
      'flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
      size === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm'
    )}>
      {initials}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    pending:   'bg-amber-500/10   text-amber-600   dark:text-amber-400',
    cancelled: 'bg-rose-500/10   text-rose-600   dark:text-rose-400',
    published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    draft:     'bg-muted          text-muted-foreground',
  }
  const label: Record<string, string> = {
    confirmed: 'Confirmada', pending: 'Pendiente', cancelled: 'Cancelada',
    published: 'Publicado',  draft: 'Borrador',
  }
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', map[status] ?? 'bg-muted text-muted-foreground')}>
      {label[status] ?? status}
    </span>
  )
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel del Profesor</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Bienvenido de vuelta. Tienes 2 sesiones hoy.</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <CalendarCheck className="size-3.5" /> Ver agenda
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Zap className="size-3.5" /> Nueva sesión
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <StaggerItem key={s.label}>
            <div className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className={cn('flex size-8 items-center justify-center rounded-lg', s.bg)}>
                  <s.icon className={cn('size-4', s.color)} />
                </div>
                <ArrowUpRight className="size-3.5 text-muted-foreground/40" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{s.delta}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">

          {/* Próximas sesiones */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Próximas sesiones</h2>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                Ver todas <ChevronRight className="size-3" />
              </button>
            </div>
            <div className="divide-y divide-border/60">
              {UPCOMING_SESSIONS.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30">
                  <Avatar2 initials={s.avatar} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{s.student}</p>
                    <p className="text-xs text-muted-foreground">{s.subject}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-muted-foreground sm:block">{s.time}</span>
                    <StatusBadge status={s.status} />
                    <button className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <MoreHorizontal className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mis cursos */}
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Mis cursos</h2>
              <button className="flex items-center gap-1.5 rounded-lg bg-primary/8 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/12 transition-colors">
                <BookOpen className="size-3" /> Crear curso
              </button>
            </div>
            <div className="divide-y divide-border/60">
              {MY_COURSES.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                    <BookOpen className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.students} alumnos · ⭐ {c.rating}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:block">{c.revenue}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Panel derecho */}
        <div className="space-y-5">

          {/* Ingresos mensuales */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Ingresos mensuales</h3>
              <TrendingUp className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-end gap-1.5 h-24">
              {MONTHLY_INCOME.map((m) => (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.amount / MAX_INCOME) * 80}px` }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    className="w-full rounded-sm bg-primary/70"
                  />
                  <span className="text-[9px] text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Total este mes: <span className="font-semibold text-foreground">S/ 3,200</span>
            </p>
          </div>

          {/* Reseñas recientes */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Reseñas recientes</h3>
            <div className="space-y-3">
              {RECENT_REVIEWS.map((r) => (
                <div key={r.id} className="rounded-lg bg-muted/40 p-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{r.author}</span>
                    <div className="flex">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">{r.text}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/50">{r.course} · {r.ago}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen rápido */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Esta semana</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Sesiones completadas', value: '8' },
                { label: 'Nuevos alumnos',        value: '3' },
                { label: 'Horas enseñadas',       value: '12 h' },
                { label: 'Mensajes recibidos',    value: '24' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-semibold text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
