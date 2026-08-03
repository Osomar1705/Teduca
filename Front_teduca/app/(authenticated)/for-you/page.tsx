'use client'

import { useEffect, useState } from 'react'
import { Sparkles, UserCog } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { MentorChat } from '@/components/ai-mentor/MentorChat'
import { FadeIn } from '@/components/common/Motion'
import { getCurrentUser } from '@/lib/edtech/service'
import { getOnboarding, type OnboardingData } from '@/lib/onboarding/service'
import { getGamificationState } from '@/lib/gamification/service'
import type { MentorContext } from '@/lib/ai-mentor/types'

export default function ForYouPage() {
  const [loading, setLoading] = useState(true)
  const [context, setContext] = useState<MentorContext | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [user, onboarding] = await Promise.all([
          getCurrentUser(),
          getOnboarding().catch(() => null as OnboardingData | null),
        ])
        const state = getGamificationState()

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
      <div className="mx-auto max-w-3xl">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-[28rem] rounded-2xl" />
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
    <div className="mx-auto max-w-3xl">
      <FadeIn>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h1 className="text-lg font-semibold text-foreground">Tu Mentor</h1>
          <Badge variant="secondary" className="text-[10px]">Beta</Badge>
        </div>
      </FadeIn>

      <MentorChat context={context} />
    </div>
  )
}
