'use client'

import { motion } from 'framer-motion'
import {
  Users, BookOpen, DollarSign, Star, TrendingUp,
  Clock, CalendarCheck, ArrowUpRight, MoreHorizontal,
  ChevronRight, Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { cn } from '@/lib/utils'
import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'
import { getMyProfile, getCoursesByTeacher, getReservations } from '@/lib/edtech/service'
import type { TeacherProfile, Course, Reservation } from '@/lib/edtech/types'

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

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const { isAllowed } = useTeacherGuard()
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAllowed) return
    async function load() {
      try {
        const p = await getMyProfile()
        setProfile(p)
        const [cs, rs] = await Promise.all([
          getCoursesByTeacher(p.id),
          getReservations(),
        ])
        setCourses(cs)
        setReservations(rs)
      } catch {
        // mantener estado vacío
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [isAllowed])

  if (!isAllowed) return null

  const upcomingSessions = reservations
    .filter((r) => r.status !== 'cancelled')
    .slice(0, 5)

  const stats = [
    { label: 'Alumnos activos',     value: profile ? String(profile.studentsCount) : '–',   delta: 'del perfil',       icon: Users,        color: 'text-blue-500',   bg: 'bg-blue-500/8'   },
    { label: 'Horas enseñadas',     value: '–',   delta: '',  icon: Clock,        color: 'text-violet-500', bg: 'bg-violet-500/8' },
    { label: 'Precio por hora',     value: profile ? `${profile.currency} ${profile.hourlyPrice}` : '–', delta: 'tarifa actual', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/8' },
    { label: 'Calificación',        value: profile ? String(profile.rating.toFixed(1)) : '–', delta: `${profile?.reviewsCount ?? 0} reseñas`, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/8' },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel del Profesor</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {loading ? 'Cargando datos…' : `Hola, ${profile?.name ?? 'Profesor'}. Tienes ${upcomingSessions.length} sesiones próximas.`}
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-border/80 hover:bg-muted hover:text-foreground hover:shadow-xs">
              <CalendarCheck className="size-3.5" /> Ver agenda
            </button>
            <button className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Zap className="size-3.5" /> Nueva sesión
            </button>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <Stagger className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <div className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className={cn('flex size-8 items-center justify-center rounded-xl', s.bg)}>
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
              {upcomingSessions.length === 0 && (
                <p className="px-5 py-6 text-sm text-muted-foreground">No tienes sesiones próximas.</p>
              )}
              {upcomingSessions.map((r) => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30">
                  <Avatar2 initials={getInitials(r.teacherName)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{r.teacherName}</p>
                    <p className="text-xs text-muted-foreground">{r.courseTitle ?? r.modality}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-muted-foreground sm:block">{r.date} {r.time}</span>
                    <StatusBadge status={r.status} />
                    <button className="rounded-xl p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
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
              <button className="flex items-center gap-1.5 rounded-xl bg-primary/8 px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/12">
                <BookOpen className="size-3" /> Crear curso
              </button>
            </div>
            <div className="divide-y divide-border/60">
              {courses.length === 0 && (
                <p className="px-5 py-6 text-sm text-muted-foreground">No tienes cursos aún.</p>
              )}
              {courses.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/8">
                    <BookOpen className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.reviewsCount} reseñas · ⭐ {c.rating.toFixed(1)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:block">
                      {c.currency} {c.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Panel derecho */}
        <div className="space-y-5">

          {/* Perfil resumen */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Mi perfil</h3>
              <TrendingUp className="size-4 text-emerald-500" />
            </div>
            {profile ? (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p><span className="font-medium text-foreground">Especialidad:</span> {profile.specialty}</p>
                <p><span className="font-medium text-foreground">Universidad:</span> {profile.university}</p>
                <p><span className="font-medium text-foreground">Modalidad:</span> {profile.modality}</p>
                <p><span className="font-medium text-foreground">Experiencia:</span> {profile.experienceYears} años</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{loading ? 'Cargando…' : 'Perfil no disponible'}</p>
            )}
          </div>

          {/* Resumen rápido */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Resumen</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Reservas activas',  value: String(reservations.filter(r => r.status === 'confirmed').length) },
                { label: 'Reservas pendientes', value: String(reservations.filter(r => r.status === 'pending').length) },
                { label: 'Cursos publicados', value: String(courses.length) },
                { label: 'Total alumnos',     value: String(profile?.studentsCount ?? '–') },
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
