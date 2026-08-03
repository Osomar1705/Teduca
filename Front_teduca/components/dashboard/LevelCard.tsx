'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import type { UserLevel } from '@/lib/gamification/types'

export function LevelCard({ xp, level }: { xp: number; level: UserLevel }) {
  const span = level.xpMax === Infinity ? xp - level.xpMin || 1 : level.xpMax - level.xpMin
  const done = xp - level.xpMin
  const pct = level.xpMax === Infinity ? 100 : (done / span) * 100

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Nivel
        </span>
        <Badge variant="default" className="text-xs">
          {level.title}
        </Badge>
      </div>
      <Progress value={pct} className="mb-1 h-1.5" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{xp} XP</span>
        <span>{level.xpMax === Infinity ? 'Máximo' : `${level.xpMax} XP`}</span>
      </div>
    </div>
  )
}
