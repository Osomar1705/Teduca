'use client'

import { Flame } from 'lucide-react'
import type { Streak } from '@/lib/gamification/types'

export function StreakCard({ streak }: { streak: Streak }) {
  return (
    <div className="rounded-xl bg-muted/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="size-4 text-orange-500" />
        <span className="text-sm font-medium text-foreground">Racha de estudio</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tracking-tight text-foreground">
          {streak.current}
        </span>
        <span className="text-sm text-muted-foreground">
          día{streak.current === 1 ? '' : 's'}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Mejor: {streak.longest} días</p>
    </div>
  )
}
