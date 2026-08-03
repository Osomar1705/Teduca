'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Flame,
  GraduationCap,
  Building2,
  CalendarDays,
  UserCog,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { FadeIn } from '@/components/common/Motion'
import { LevelCard } from '@/components/dashboard/LevelCard'
import { AchievementCard } from '@/components/gamification/AchievementCard'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { APP_ROUTES } from '@/lib/constants'
import { getCurrentUser, getReservations } from '@/lib/edtech/service'
import { getOnboarding, type OnboardingData } from '@/lib/onboarding/service'
import { getGamificationState } from '@/lib/gamification/service'
import { ACHIEVEMENTS } from '@/lib/gamification/achievements'
import { cn } from '@/lib/utils'
import type { GamificationState } from '@/lib/gamification/types'

type Tab = 'profile' | 'editor'

interface Identity {
  name: string
  avatar?: string
  username?: string
  institution?: string
  career?: string
  academicYear?: string
  goals: string[]
  subjects: string[]
  projects: string[]
}

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [game, setGame] = useState<GamificationState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setGame(getGamificationState())

    async function load() {
      const user = await getCurrentUser()
      const onboarding = await getOnboarding().catch(() => null as OnboardingData | null)
      getReservations().catch(() => {})
      setIdentity({
        name: onboarding?.full_name || user.name,
        avatar: user.avatar,
        username: onboarding?.username ?? undefined,
        institution: onboarding?.institution ?? undefined,
        career: onboarding?.career ?? undefined,
        academicYear: onboarding?.academic_year ?? undefined,
        goals: onboarding?.goals ?? [],
        subjects: onboarding?.subject_tags ?? [],
        projects: onboarding?.project_interests ?? [],
      })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex gap-0 border-b border-border">
        {(
          [
            { key: 'profile', label: 'Mi Perfil' },
            { key: 'editor', label: 'Editor' },
          ] as { key: Tab; label: string }[]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'editor' ? (
        <ProfileEditor />
      ) : loading || !identity || !game ? (
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : (
        <FadeIn>
          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            <aside>
              <Avatar src={identity.avatar} name={identity.name} size="xl" className="mb-3" />
              <h1 className="text-xl font-bold text-foreground">{identity.name}</h1>
              {identity.username && (
                <p className="text-sm text-muted-foreground">@{identity.username}</p>
              )}

              <div className="mt-4 flex gap-4 text-sm">
                <div>
                  <span className="font-semibold text-foreground">{game.xp}</span>{' '}
                  <span className="text-muted-foreground">XP</span>
                </div>
                <div className="inline-flex items-center gap-1">
                  <Flame className="size-3.5 text-orange-500" />
                  <span className="font-semibold text-foreground">{game.streak.current}</span>{' '}
                  <span className="text-muted-foreground">días</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {identity.institution && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    {identity.institution}
                  </div>
                )}
                {identity.career && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <GraduationCap className="size-3.5 text-muted-foreground" />
                    {identity.career}
                  </div>
                )}
                {identity.academicYear && (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <CalendarDays className="size-3.5 text-muted-foreground" />
                    {identity.academicYear}
                  </div>
                )}
              </div>

              {identity.subjects.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {identity.subjects.slice(0, 6).map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </aside>

            <div className="space-y-6">
              <section>
                <h2 className="mb-3 text-base font-semibold text-foreground">
                  Progreso académico
                </h2>
                <LevelCard xp={game.xp} level={game.level} />
              </section>

              {identity.goals.length > 0 && (
                <section>
                  <h2 className="mb-3 text-base font-semibold text-foreground">Objetivos</h2>
                  <div className="flex flex-wrap gap-2">
                    {identity.goals.map((g) => (
                      <Badge key={g} variant="outline">
                        {g}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {identity.projects.length > 0 && (
                <section>
                  <h2 className="mb-3 text-base font-semibold text-foreground">
                    Intereses de proyecto
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    {identity.projects.map((p) => (
                      <Badge key={p} variant="secondary">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="mb-3 text-base font-semibold text-foreground">Logros</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ACHIEVEMENTS.slice(0, 4).map((a) => (
                    <AchievementCard key={a.id} achievement={a} />
                  ))}
                </div>
              </section>

              {identity.goals.length === 0 &&
                identity.subjects.length === 0 &&
                identity.projects.length === 0 && (
                  <EmptyState
                    icon={UserCog}
                    title="Completá tu identidad académica"
                    description="Agregá objetivos e intereses para que tu perfil brille."
                    action={
                      <Button variant="brand" asChild>
                        <Link href={APP_ROUTES.ONBOARDING}>Completar</Link>
                      </Button>
                    }
                  />
                )}
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
