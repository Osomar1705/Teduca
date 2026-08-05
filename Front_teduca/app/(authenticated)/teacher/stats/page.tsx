'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Clock, Star, Eye, BookOpen, Award } from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { cn } from '@/lib/utils'

const GROWTH_DATA = [
  { month: 'Sep', students: 68,  hours: 52,  revenue: 1800 },
  { month: 'Oct', students: 81,  hours: 63,  revenue: 2100 },
  { month: 'Nov', students: 95,  hours: 71,  revenue: 2600 },
  { month: 'Dic', students: 108, hours: 76,  revenue: 2800 },
  { month: 'Ene', students: 118, hours: 80,  revenue: 3100 },
  { month: 'Feb', students: 124, hours: 86,  revenue: 3200 },
]

const TOP_COURSES = [
  { title: 'React & Next.js para todos', views: 1240, enrollments: 48, rating: 4.9, completion: 72 },
  { title: 'Machine Learning con Python', views: 980,  enrollments: 36, rating: 4.8, completion: 65 },
  { title: 'Robótica e IoT con Arduino',  views: 340,  enrollments: 12, rating: 4.7, completion: 45 },
]

const REVIEWS_BREAKDOWN = [
  { stars: 5, count: 98, pct: 69 },
  { stars: 4, count: 32, pct: 23 },
  { stars: 3, count: 10, pct:  7 },
  { stars: 2, count:  1, pct:  1 },
  { stars: 1, count:  1, pct:  1 },
]

function BarChart({ data, key1, label, color }: {
  data: typeof GROWTH_DATA
  key1: keyof typeof GROWTH_DATA[0]
  label: string
  color: string
}) {
  const max = Math.max(...data.map((d) => d[key1] as number))
  return (
    <div>
      <p className="mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      <div className="flex items-end gap-2 h-24">
        {data.map((d) => (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${((d[key1] as number) / max) * 80}px` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className={cn('w-full rounded-t-sm', color)}
            />
            <span className="text-[9px] text-muted-foreground">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TeacherStatsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Estadísticas</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Seguimiento del crecimiento de tu plataforma educativa</p>
        </div>
      </FadeIn>

      {/* KPIs */}
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total alumnos',   value: '124',    icon: Users,    color: 'text-blue-500',    bg: 'bg-blue-500/8',    delta: '+8 vs mes anterior' },
          { label: 'Horas enseñadas', value: '86 h',   icon: Clock,    color: 'text-violet-500',  bg: 'bg-violet-500/8',  delta: '+12 esta semana'     },
          { label: 'Calificación',    value: '4.9 ★',  icon: Star,     color: 'text-amber-500',   bg: 'bg-amber-500/8',   delta: '142 reseñas'          },
          { label: 'Cursos activos',  value: '2',      icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/8', delta: '1 borrador'           },
        ].map((k) => (
          <StaggerItem key={k.label}>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className={cn('mb-3 flex size-8 items-center justify-center rounded-lg', k.bg)}>
                <k.icon className={cn('size-4', k.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground/60">{k.delta}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Crecimiento de alumnos */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Crecimiento de alumnos</h2>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <BarChart data={GROWTH_DATA} key1="students" label="Alumnos activos" color="bg-blue-500/70" />
        </div>

        {/* Horas enseñadas */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Horas enseñadas</h2>
            <Clock className="size-4 text-violet-500" />
          </div>
          <BarChart data={GROWTH_DATA} key1="hours" label="Horas por mes" color="bg-violet-500/70" />
        </div>

        {/* Top cursos */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Rendimiento por curso</h2>
          <div className="space-y-4">
            {TOP_COURSES.map((c) => (
              <div key={c.title}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-medium text-foreground">{c.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{c.completion}% completado</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.completion}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Eye className="size-2.5" />{c.views}</span>
                  <span className="flex items-center gap-0.5"><Users className="size-2.5" />{c.enrollments}</span>
                  <span className="flex items-center gap-0.5"><Star className="size-2.5 fill-amber-400 text-amber-400" />{c.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución de reseñas */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-sm font-semibold text-foreground">Distribución de calificaciones</h2>
          </div>
          <div className="mb-4 flex items-end gap-4">
            <p className="text-4xl font-bold text-foreground">4.9</p>
            <div>
              <div className="flex">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">142 reseñas</p>
            </div>
          </div>
          <div className="space-y-2">
            {REVIEWS_BREAKDOWN.map((r) => (
              <div key={r.stars} className="flex items-center gap-2">
                <span className="w-4 shrink-0 text-right text-xs text-muted-foreground">{r.stars}</span>
                <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.pct}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full rounded-full bg-amber-400"
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Logros */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Logros</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Primer curso publicado',  icon: BookOpen, date: 'Oct 2024', achieved: true },
            { label: '100 alumnos',             icon: Users,    date: 'Ene 2025', achieved: true },
            { label: 'Calificación 4.9+',       icon: Star,     date: 'Feb 2025', achieved: true },
            { label: '200 alumnos',             icon: Users,    date: null,       achieved: false },
            { label: '3 cursos publicados',     icon: BookOpen, date: null,       achieved: false },
            { label: '500 horas enseñadas',     icon: Clock,    date: null,       achieved: false },
          ].map((a) => (
            <div key={a.label} className={cn(
              'flex items-center gap-3 rounded-lg border p-3',
              a.achieved ? 'border-amber-500/20 bg-amber-500/5' : 'border-border bg-muted/20'
            )}>
              <div className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full',
                a.achieved ? 'bg-amber-500/10' : 'bg-muted'
              )}>
                <a.icon className={cn('size-4', a.achieved ? 'text-amber-500' : 'text-muted-foreground/40')} />
              </div>
              <div>
                <p className={cn('text-xs font-medium', a.achieved ? 'text-foreground' : 'text-muted-foreground/60')}>
                  {a.label}
                </p>
                {a.achieved && a.date && <p className="text-[10px] text-amber-600 dark:text-amber-400">{a.date}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
