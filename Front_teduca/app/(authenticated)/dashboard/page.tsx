'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Compass,
  BookOpen,
  Heart,
  CalendarCheck,
  ArrowRight,
  Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { LevelCard } from '@/components/dashboard/LevelCard'
import { WeeklyGoals } from '@/components/dashboard/WeeklyGoals'
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
  const [game, setGame] = useState<GamificationState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    recordDailyActivity()
    setGame(getGamificationState())

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
      <WeeklyGoals weeklyXP={game.weeklyXP} weeklyGoal={game.weeklyGoal} goals={goals} />
    </>
  )

  return (
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          <FadeIn>
            <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-brand p-6 text-white shadow-lg">
              <div className="bg-grid-light absolute inset-0" />
              <div className="relative">
                <p className="text-sm text-white/80">Hola{name ? `, ${name}` : ''} 👋</p>
                <h1 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">
                  Seguí construyendo tu camino académico
                </h1>
              </div>
              {game && (
                <div className="relative flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-white/70">Nivel</p>
                    <p className="font-semibold">{game.level.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2">
                    <Flame className="size-4" />
                    <span className="font-semibold">{game.streak.current}</span>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Widgets compactos en mobile */}
          {game && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:hidden">{widgets}</div>
          )}

          <Stagger className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Profesores', value: teacherCount || '—', icon: Compass, href: APP_ROUTES.DISCOVER },
              { title: 'Cursos', value: courseCount || '—', icon: BookOpen, href: APP_ROUTES.COURSES },
              { title: 'Favoritos', value: favCount, icon: Heart, href: APP_ROUTES.FAVORITES },
              { title: 'Reservas', value: activeReservations.length, icon: CalendarCheck, href: APP_ROUTES.RESERVATIONS },
            ].map((s) => (
              <StaggerItem key={s.title}>
                <Link href={s.href} className="block">
                  <StatsCard title={s.title} value={s.value} icon={s.icon} />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>

          <section className="mb-8">
            <SectionHeader title="Próximas mentorías" href={APP_ROUTES.RESERVATIONS} />
            {loading ? (
              <Skeleton className="h-24 rounded-xl" />
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
              <div className="space-y-3">
                {upcoming.map((r) => (
                  <Card key={r.id} className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{r.teacherName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {r.courseTitle ?? 'Clase particular'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <p className="font-medium text-foreground">{formatDate(r.date)}</p>
                      <p className="text-muted-foreground">{r.time}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="mb-8">
            <SectionHeader title="Continuar aprendiendo" href={APP_ROUTES.COURSES} />
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            ) : (
              <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                  <StaggerItem key={c.id}>
                    <CourseCard course={c} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </section>

          <section>
            <SectionHeader title="Descubrir" href={APP_ROUTES.DISCOVER} />
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            ) : (
              <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">{widgets}</div>
        </aside>
      </div>
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Ver todos <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
