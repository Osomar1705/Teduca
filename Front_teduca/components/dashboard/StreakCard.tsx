'use client'

import { Flame } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import type { Streak } from '@/lib/gamification/types'

export function StreakCard({ streak }: { streak: Streak }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Racha de estudio</p>
        <Flame className="size-5 text-orange-500" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
          {streak.current}
        </span>
        <span className="text-sm text-muted-foreground">
          día{streak.current === 1 ? '' : 's'} 🔥
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>Récord: {streak.longest} días</span>
        <span>
          {streak.lastActiveDate ? formatDate(streak.lastActiveDate) : 'Sin actividad'}
        </span>
      </div>
    </Card>
  )
}
