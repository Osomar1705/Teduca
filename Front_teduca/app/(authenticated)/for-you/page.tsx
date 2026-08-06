'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Telescope, ArrowRight, UserCog } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { MentorChat } from '@/components/ai-mentor/MentorChat'
import { FadeIn } from '@/components/common/Motion'
import { APP_ROUTES } from '@/lib/constants'
import { getCourses, getCurrentUser, getTeachers } from '@/lib/edtech/service'
import { getOnboarding, type OnboardingData } from '@/lib/onboarding/service'
import { getGamificationState } from '@/lib/gamification/service'
import type { MentorContext } from '@/lib/ai-mentor/types'
import type { Course, TeacherProfile } from '@/lib/edtech/types'

export default function ForYouPage() {
  const [loading, setLoading] = useState(true)
  const [context, setContext] = useState<MentorContext | null>(null)
  const [goals, setGoals] = useState<string[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])

  useEffect(() => {
    async function load() {
      try {
        const [user, onboarding, allCourses, allTeachers] = await Promise.all([
          getCurrentUser(),
          getOnboarding().catch(() => null as OnboardingData | null),
          getCourses().catch(() => [] as Course[]),
          getTeachers().catch(() => [] as TeacherProfile[]),
        ])
        const state = getGamificationState()

        setContext({
          userName: onboarding?.full_name || user.name,
          goals: onboarding?.goals ?? [],
          subjects: onboarding?.subject_tags ?? [],
          streakDays: state.streak.current,
          recentActivity: [],
          xp: state.xp,
          level: state.level.title,
          weeklyXP: state.weeklyXP,
          weeklyGoal: state.weeklyGoal,
          orbits: 0,
          reservationsCount: 0,
          coursesCount: allCourses.length,
          projectInterests: onboarding?.project_interests ?? [],
          learningStyles: onboarding?.learning_styles ?? [],
        })
        setGoals(onboarding?.goals ?? [])
        setCourses(allCourses.slice(0, 3))
        setTeachers(allTeachers.slice(0, 3))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-[28rem] rounded-2xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    )
  }

  if (!context) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={UserCog}
          title="No se pudo cargar el contenido"
          description="Verificá tu conexión e intentá recargar la página."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Mentor */}
      <FadeIn>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Telescope className="size-4 text-muted-foreground" />
              <h1 className="text-base font-semibold text-foreground">Tu Mentor</h1>
            </div>
            <span className="rounded-xl bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Beta
            </span>
          </div>
          <MentorChat context={context} />
        </section>
      </FadeIn>

      {/* Continuar aprendiendo */}
      {courses.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Continuar aprendiendo</h2>
            <Link href={APP_ROUTES.COURSES} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">
                  {c.category.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.teacherName}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Objetivos */}
      {goals.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Tus objetivos</h2>
          <ul className="space-y-2">
            {goals.map((g, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {g}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recomendaciones */}
      {teachers.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Profesores recomendados</h2>
            <Link href={APP_ROUTES.DISCOVER} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Ver más <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border">
            {teachers.map((t) => (
              <Link
                key={t.id}
                href={`/discover/${t.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {(t.name ?? '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t.categories?.slice(0, 2).join(' · ')}
                  </p>
                </div>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
