'use client'

import { Flame } from 'lucide-react'
import type { Streak } from '@/lib/gamification/types'

export function StreakCard({ streak }: { streak: Streak }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 shadow-xs">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="size-4 text-orange-500" />
        <span className="text-sm font-medium text-foreground">Racha de estudio</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[2.5rem] font-bold tracking-tight text-foreground">
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
