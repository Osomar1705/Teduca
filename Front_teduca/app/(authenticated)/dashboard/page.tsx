'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CalendarCheck,
  ArrowRight,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { LevelCard } from '@/components/dashboard/LevelCard'
import { WeeklyGoals } from '@/components/dashboard/WeeklyGoals'
import { RewardSummaryWidget } from '@/components/dashboard/RewardSummaryWidget'
import { TeacherCard } from '@/components/edtech/TeacherCard'
import { CourseCard } from '@/components/edtech/CourseCard'
import { EmptyState } from '@/components/common/EmptyState'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { APP_ROUTES } from '@/lib/constants'
import {
  getCourses,
  getCurrentUser,
  getFavorites,
  getReservations,
  getTeachers,
} from '@/lib/edtech/service'
import { getOnboarding } from '@/lib/onboarding/service'
import {
  getGamificationState,
  recordDailyActivity,
} from '@/lib/gamification/service'
import { formatDate } from '@/lib/format'
import type { Course, Reservation, TeacherProfile } from '@/lib/edtech/types'
import type { GamificationState } from '@/lib/gamification/types'

export default function DashboardPage() {
  const [name, setName] = useState('')
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [favCount, setFavCount] = useState(0)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [teacherCount, setTeacherCount] = useState(0)
  const [courseCount, setCourseCount] = useState(0)
  const [goals, setGoals] = useState<string[]>([])
  const [game] = useState<GamificationState | null>(getGamificationState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recordDailyActivity()

    async function load() {
      const [user, t, c, f, r] = await Promise.all([
        getCurrentUser(),
        getTeachers(),
        getCourses(),
        getFavorites(),
        getReservations(),
      ])
      setName(user.name.split(' ')[0])
      setTeachers(t.slice(0, 3))
      setTeacherCount(t.length)
      setCourses(c.slice(0, 3))
      setCourseCount(c.length)
      setFavCount(f.length)
      setReservations(r)
      getOnboarding()
        .then((o) => setGoals(o.goals ?? []))
        .catch(() => {})
      setLoading(false)
    }
    load()
  }, [])

  const activeReservations = reservations.filter((x) => x.status !== 'cancelled')
  const upcoming = reservations
    .filter((r) => r.status === 'confirmed')
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    .slice(0, 3)

  const widgets = game && (
    <>
      <StreakCard streak={game.streak} />
      <LevelCard xp={game.xp} level={game.level} />
      <RewardSummaryWidget />
      <WeeklyGoals weeklyXP={game.weeklyXP} weeklyGoal={game.weeklyGoal} goals={goals} />
    </>
  )

  const stats = [
    { label: 'Profesores', value: teacherCount || 0, href: APP_ROUTES.DISCOVER },
    { label: 'Cursos', value: courseCount || 0, href: APP_ROUTES.COURSES },
    { label: 'Favoritos', value: favCount, href: APP_ROUTES.FAVORITES },
    { label: 'Reservas', value: activeReservations.length, href: APP_ROUTES.RESERVATIONS },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex gap-6">
        <div className="min-w-0 flex-1">
          <FadeIn>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Hola de nuevo</p>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {name || 'Estudiante'}
                </h1>
              </div>
              {game && game.streak.current > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-sm font-medium text-orange-600 dark:text-orange-400">
                  <Flame className="size-3.5" />
                  {game.streak.current} días
                </div>
              )}
            </div>
          </FadeIn>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-xl border border-transparent bg-muted/40 px-4 py-3 transition-all hover:border-border/60 hover:bg-muted/70 hover:shadow-xs"
              >
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </Link>
            ))}
          </div>

          {/* Widgets compactos en mobile */}
          {game && (
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">{widgets}</div>
          )}

          <section className="mb-6">
            <SectionHeader title="Próximas mentorías" href={APP_ROUTES.RESERVATIONS} />
            {loading ? (
              <Skeleton className="h-20 rounded-xl" />
            ) : upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarCheck}
                title="No tenés mentorías próximas"
                description="Reservá una clase con un profesor y aparecerá acá."
                action={
                  <Button variant="brand" asChild>
                    <Link href={APP_ROUTES.DISCOVER}>Descubrir profesores</Link>
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border">
                {upcoming.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {r.teacherName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.courseTitle ?? 'Clase particular'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-foreground">{formatDate(r.date)}</p>
                      <p className="text-xs text-muted-foreground">{r.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mb-6">
            <SectionHeader title="Continuar aprendiendo" href={APP_ROUTES.COURSES} />
            {loading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <Stagger className="grid gap-3 sm:grid-cols-2">
                {courses.map((c) => (
                  <StaggerItem key={c.id}>
                    <CourseCard course={c} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>

          <section>
            <SectionHeader title="Profesores recomendados" href={APP_ROUTES.DISCOVER} />
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : (
              <Stagger className="grid gap-4 sm:grid-cols-2">
                {teachers.map((t) => (
                  <StaggerItem key={t.id}>
                    <TeacherCard teacher={t} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>
        </div>

        {/* Columna derecha sticky (desktop) */}
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 space-y-4">{widgets}</div>
        </aside>
      </div>
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        Ver más <ArrowRight className="size-3" />
      </Link>
    </div>
  )
}
