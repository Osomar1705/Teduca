'use client'

import { useEffect, useState } from 'react'
import { Sparkles, Flame, Target, UserCog } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { MentorChat } from '@/components/ai-mentor/MentorChat'
import { FadeIn } from '@/components/common/Motion'
import { getCurrentUser } from '@/lib/edtech/service'
import { getOnboarding, type OnboardingData } from '@/lib/onboarding/service'
import { getGamificationState } from '@/lib/gamification/service'
import type { MentorContext } from '@/lib/ai-mentor/types'
import type { UserLevel } from '@/lib/gamification/types'

export default function ForYouPage() {
  const [loading, setLoading] = useState(true)
  const [context, setContext] = useState<MentorContext | null>(null)
  const [level, setLevel] = useState<UserLevel | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [user, onboarding] = await Promise.all([
          getCurrentUser(),
          getOnboarding().catch(() => null as OnboardingData | null),
        ])
        const state = getGamificationState()
        setLevel(state.level)

        setContext({
          userName: onboarding?.full_name || user.name,
          goals: onboarding?.goals ?? [],
          subjects: onboarding?.subject_tags ?? [],
          streakDays: state.streak.current,
          recentActivity: [],
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <Skeleton className="mb-6 h-9 w-72" />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-[28rem] rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!context) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={UserCog}
          title="No se pudo cargar el mentor"
          description="Verificá tu conexión e intentá recargar la página."
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <FadeIn>
        <div className="mb-6 flex items-center gap-3">
          <div className="bg-gradient-brand inline-flex size-11 items-center justify-center rounded-xl text-white">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Tu Mentor Académico
              </h1>
              <Badge variant="default">IA</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Guía personalizada según tus objetivos y tu progreso.
            </p>
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          <Card className="p-5">
            <p className="font-semibold text-foreground">{context.userName}</p>
            {level && (
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: level.color }}
                >
                  {level.title}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Flame className="size-4 text-orange-500" />
                  {context.streakDays} día{context.streakDays === 1 ? '' : 's'}
                </span>
              </div>
            )}
          </Card>

          {context.goals.length > 0 && (
            <Card className="p-5">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Target className="size-4" /> Tus objetivos
              </p>
              <ul className="space-y-1.5">
                {context.goals.slice(0, 4).map((g) => (
                  <li key={g} className="text-sm text-foreground">
                    • {g}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {context.subjects.length > 0 && (
            <Card className="p-5">
              <p className="mb-2 text-sm font-medium text-muted-foreground">Intereses</p>
              <div className="flex flex-wrap gap-1.5">
                {context.subjects.slice(0, 6).map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </aside>

        <MentorChat context={context} />
      </div>
    </div>
  )
}
