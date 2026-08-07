'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Gift, ArrowRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { AchievementCard } from '@/components/gamification/AchievementCard'
import { RewardCard } from '@/components/gamification/RewardCard'
import { Stagger, StaggerItem } from '@/components/common/Motion'
import { ACHIEVEMENTS } from '@/lib/gamification/achievements'
import {
  getGamificationState,
  recordDailyActivity,
} from '@/lib/gamification/service'
import { getMarketplaceItems } from '@/lib/rewards/service'
import { APP_ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { GamificationState } from '@/lib/gamification/types'
import type { RewardItem } from '@/lib/rewards/types'

type Filter = 'all' | 'unlocked' | 'locked'

export default function AchievementsPage() {
  const [state, setState] = useState<GamificationState | null>(null)
  const [rewards] = useState<RewardItem[]>(() => getMarketplaceItems().slice(0, 4))
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    getGamificationState().then(setState).catch(() => {})
    recordDailyActivity().catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'unlocked') return ACHIEVEMENTS.filter((a) => a.unlockedAt)
    if (filter === 'locked') return ACHIEVEMENTS.filter((a) => !a.unlockedAt)
    return ACHIEVEMENTS
  }, [filter])

  const xpPct = useMemo(() => {
    if (!state) return 0
    const { xp, level } = state
    if (level.xpMax === Infinity) return 100
    return ((xp - level.xpMin) / (level.xpMax - level.xpMin)) * 100
  }, [state])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Logros</h1>
        <p className="text-sm text-muted-foreground">
          Tu progreso, Orbits y objetivos desbloqueables.
        </p>
      </div>

      {!state ? (
        <Skeleton className="mb-8 h-20 rounded-xl" />
      ) : (
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl bg-muted/50 p-4">
          <div>
            <p className="text-xs text-muted-foreground">Nivel actual</p>
            <p className="text-xl font-bold text-foreground">{state.level.title}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-xs text-muted-foreground">XP total</p>
            <p className="text-xl font-bold text-foreground">{state.xp}</p>
          </div>
          <div className="ml-auto w-full sm:w-auto">
            <Progress value={xpPct} className="h-1.5 w-full sm:w-32" />
            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              {state.level.xpMax === Infinity
                ? 'Nivel máximo'
                : `${state.xp}/${state.level.xpMax} para el siguiente nivel`}
            </p>
          </div>
        </div>
      )}

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Canjeá tus Orbits</h2>
          <Link
            href={APP_ROUTES.REWARDS}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Gift className="size-3.5" /> Tienda de Orbits <ArrowRight className="size-3" />
          </Link>
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rewards.map((r) => (
            <StaggerItem key={r.id}>
              <RewardCard reward={r} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Logros</h2>
          <div className="flex gap-2">
            {(
              [
                { key: 'all', label: 'Todos' },
                { key: 'unlocked', label: 'Desbloqueados' },
                { key: 'locked', label: 'Bloqueados' },
              ] as { key: Filter; label: string }[]
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  filter === f.key
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Stagger className="grid gap-3 sm:grid-cols-2">
          {filtered.map((a) => (
            <StaggerItem key={a.id}>
              <AchievementCard achievement={a} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  )
}
