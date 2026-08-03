'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Flame,
  Trophy,
  Zap,
  BookOpen,
  GraduationCap,
  Target,
  Sparkles,
  Code2,
  UserCog,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { FadeIn } from '@/components/common/Motion'
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
  const [courseCount, setCourseCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setGame(getGamificationState())

    async function load() {
      const user = await getCurrentUser()
      const onboarding = await getOnboarding().catch(() => null as OnboardingData | null)
      getReservations()
        .then((r) => setCourseCount(new Set(r.filter((x) => x.courseId).map((x) => x.courseId)).size))
        .catch(() => {})
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
      <div className="mb-6 flex gap-2">
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
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
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
        <FadeIn className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-brand h-28" />
            <div className="px-6 pb-6">
              <div className="-mt-10 flex items-end gap-4">
                <Avatar
                  src={identity.avatar}
                  name={identity.name}
                  size="xl"
                  className="rounded-2xl border-4 border-card shadow-md"
                />
                <div className="pb-1">
                  <h1 className="text-xl font-bold text-foreground">{identity.name}</h1>
                  {identity.username && (
                    <p className="text-sm text-muted-foreground">@{identity.username}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                {identity.institution && (
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="size-4" /> {identity.institution}
                  </span>
                )}
                {identity.career && <span>· {identity.career}</span>}
                {identity.academicYear && <span>· {identity.academicYear}</span>}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatMini icon={<Zap className="size-4" />} label="XP" value={`${game.xp}`} />
            <StatMini
              icon={<Flame className="size-4 text-orange-500" />}
              label="Racha"
              value={`${game.streak.current}`}
            />
            <StatMini icon={<Trophy className="size-4" />} label="Nivel" value={game.level.title} />
            <StatMini icon={<BookOpen className="size-4" />} label="Cursos" value={`${courseCount}`} />
          </div>

          <ChipSection
            icon={<Target className="size-4" />}
            title="Objetivos"
            items={identity.goals}
            empty="Definí tus objetivos en el onboarding."
          />
          <ChipSection
            icon={<Sparkles className="size-4" />}
            title="Intereses"
            items={identity.subjects}
            empty="Agregá tus áreas de interés."
          />
          <ChipSection
            icon={<Code2 className="size-4" />}
            title="Tecnologías y proyectos"
            items={identity.projects}
            empty="Contanos qué te gusta construir."
          />

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Logros</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {ACHIEVEMENTS.slice(0, 3).map((a) => (
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
        </FadeIn>
      )}
    </div>
  )
}

function StatMini({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </Card>
  )
}

function ChipSection({
  icon,
  title,
  items,
  empty,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
  empty: string
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-1.5 text-lg font-semibold text-foreground">
        {icon} {title}
      </h2>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((i) => (
            <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm">
              {i}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  )
}
