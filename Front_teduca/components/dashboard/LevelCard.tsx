'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { UserLevel } from '@/lib/gamification/types'

export function LevelCard({ xp, level }: { xp: number; level: UserLevel }) {
  const span = level.xpMax === Infinity ? xp - level.xpMin || 1 : level.xpMax - level.xpMin
  const done = xp - level.xpMin
  const pct = level.xpMax === Infinity ? 100 : (done / span) * 100
  const toNext = level.xpMax === Infinity ? 0 : level.xpMax - xp

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Nivel académico</p>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: level.color }}
        >
          Nvl {level.level}
        </span>
      </div>
      <p className="mt-2 text-lg font-bold text-foreground">{level.title}</p>
      <div className="mt-3">
        <Progress value={pct} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{xp} XP</span>
        <span>
          {level.xpMax === Infinity ? 'Nivel máximo' : `Faltan ${toNext} XP`}
        </span>
      </div>
    </Card>
  )
}
