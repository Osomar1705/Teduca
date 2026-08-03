'use client'

import { useEffect, useMemo, useState } from 'react'
import { Flame, Trophy, Zap } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AchievementCard } from '@/components/gamification/AchievementCard'
import { RewardCard } from '@/components/gamification/RewardCard'
import { Stagger, StaggerItem } from '@/components/common/Motion'
import { ACHIEVEMENTS } from '@/lib/gamification/achievements'
import { getGamificationState } from '@/lib/gamification/service'
import { getAvailableRewards } from '@/lib/rewards/service'
import { cn } from '@/lib/utils'
import type { GamificationState } from '@/lib/gamification/types'
import type { Reward } from '@/lib/rewards/types'

type Filter = 'all' | 'unlocked' | 'locked'

export default function AchievementsPage() {
  const [state, setState] = useState<GamificationState | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    setState(getGamificationState())
    setRewards(getAvailableRewards())
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'unlocked') return ACHIEVEMENTS.filter((a) => a.unlockedAt)
    if (filter === 'locked') return ACHIEVEMENTS.filter((a) => !a.unlockedAt)
    return ACHIEVEMENTS
  }, [filter])

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Logros"
        description="Tu progreso, recompensas y objetivos desbloqueables."
      />

      {!state ? (
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<Trophy className="size-5" />}
            label="Nivel"
            value={state.level.title}
            hint={`Nivel ${state.level.level}`}
          />
          <SummaryCard
            icon={<Zap className="size-5" />}
            label="Experiencia"
            value={`${state.xp} XP`}
            hint="Puntos acumulados"
          />
          <SummaryCard
            icon={<Flame className="size-5 text-orange-500" />}
            label="Racha"
            value={`${state.streak.current} días`}
            hint={`Récord: ${state.streak.longest}`}
          />
        </div>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
          Recompensas disponibles
        </h2>
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rewards.map((r) => (
            <StaggerItem key={r.id}>
              <RewardCard reward={r} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Logros</h2>
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
                  'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
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

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

function SummaryCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
    </Card>
  )
}
