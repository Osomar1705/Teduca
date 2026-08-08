'use client'

import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'

import { useEffect, useState } from 'react'
import { TrendingUp, Users, Clock, Star, BookOpen, BarChart3 } from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { cn } from '@/lib/utils'
import { getMyProfile, getCoursesByTeacher } from '@/lib/edtech/service'
import type { TeacherProfile, Course } from '@/lib/edtech/types'

export default function TeacherStatsPage() {
  const { isAllowed } = useTeacherGuard()
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAllowed) return
    async function load() {
      try {
        const p = await getMyProfile()
        setProfile(p)
        const cs = await getCoursesByTeacher(p.id)
        setCourses(cs)
      } catch {
        // mantener vacío
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [isAllowed])

  if (!isAllowed) return null

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
          { label: 'Total alumnos',   value: loading ? '…' : (profile ? String(profile.studentsCount) : '0'), icon: Users,    color: 'text-blue-500',    bg: 'bg-blue-500/8',    delta: 'del perfil' },
          { label: 'Horas enseñadas', value: '–',   icon: Clock,    color: 'text-violet-500',  bg: 'bg-violet-500/8',  delta: 'próximamente' },
          { label: 'Calificación',    value: loading ? '…' : (profile && profile.rating > 0 ? `${profile.rating.toFixed(1)} ★` : '–'), icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/8', delta: loading ? '' : `${profile?.reviewsCount ?? 0} reseñas` },
          { label: 'Cursos activos',  value: loading ? '…' : String(courses.length), icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/8', delta: 'en marketplace' },
        ].map((k) => (
          <StaggerItem key={k.label}>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className={cn('mb-3 flex size-8 items-center justify-center rounded-xl', k.bg)}>
                <k.icon className={cn('size-4', k.color)} />
              </div>
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground/60">{k.delta}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Gráficos de crecimiento — pendientes de datos reales */}
      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Crecimiento de alumnos</h2>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart3 className="mb-3 size-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Las estadísticas históricas estarán disponibles próximamente.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Los datos se acumularán a medida que uses la plataforma.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Horas enseñadas</h2>
            <Clock className="size-4 text-violet-500" />
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart3 className="mb-3 size-8 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Las estadísticas históricas estarán disponibles próximamente.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Los datos se acumularán a medida que uses la plataforma.
            </p>
          </div>
        </div>

        {/* Rendimiento por curso */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Rendimiento por curso</h2>
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="mb-3 size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Aún no tienes cursos publicados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((c) => (
                <div key={c.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium text-foreground">{c.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {c.reviewsCount} {c.reviewsCount === 1 ? 'reseña' : 'reseñas'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {c.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="size-2.5 fill-amber-400 text-amber-400" />
                        {c.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribución de calificaciones */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Calificación general</h2>
          {!profile || profile.rating === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Star className="mb-3 size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Aún no tienes calificaciones.</p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Las reseñas aparecerán cuando tus alumnos califiquen tus clases.
              </p>
            </div>
          ) : (
            <div className="flex items-end gap-4">
              <p className="text-4xl font-bold text-foreground">{profile.rating.toFixed(1)}</p>
              <div>
                <div className="flex">
                  {[1,2,3,4,5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        'size-4',
                        i <= Math.round(profile.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">{profile.reviewsCount} reseñas</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Logros — pendientes de datos reales */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Logros</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Primer curso publicado',  icon: BookOpen, achieved: courses.length >= 1 },
            { label: '100 alumnos',             icon: Users,    achieved: (profile?.studentsCount ?? 0) >= 100 },
            { label: 'Calificación 4.9+',       icon: Star,     achieved: (profile?.rating ?? 0) >= 4.9 },
            { label: '200 alumnos',             icon: Users,    achieved: (profile?.studentsCount ?? 0) >= 200 },
            { label: '3 cursos publicados',     icon: BookOpen, achieved: courses.length >= 3 },
            { label: '500 horas enseñadas',     icon: Clock,    achieved: false },
          ].map((a) => (
            <div key={a.label} className={cn(
              'flex items-center gap-3 rounded-xl border p-3',
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
                {a.achieved && <p className="text-[10px] text-amber-600 dark:text-amber-400">Completado</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
