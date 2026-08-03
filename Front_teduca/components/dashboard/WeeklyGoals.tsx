'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export function WeeklyGoals({
  weeklyXP,
  weeklyGoal,
  goals,
}: {
  weeklyXP: number
  weeklyGoal: number
  goals: string[]
}) {
  const [done, setDone] = useState<Set<number>>(new Set())
  const pct = weeklyGoal > 0 ? (weeklyXP / weeklyGoal) * 100 : 0
  const list = goals.slice(0, 3)

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="mb-3 text-sm font-medium text-foreground">Esta semana</p>

      <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>Progreso</span>
        <span>
          {weeklyXP}/{weeklyGoal} XP
        </span>
      </div>
      <Progress value={pct} className="h-1.5" />

      {list.length > 0 ? (
        <div className="mt-3">
          {list.map((goal, i) => {
            const checked = done.has(i)
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-2 py-1.5 text-left text-sm"
              >
                <span
                  className={cn(
                    'flex size-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    checked
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border'
                  )}
                >
                  {checked && <Check className="size-2.5" />}
                </span>
                <span
                  className={cn(
                    checked ? 'text-muted-foreground line-through' : 'text-muted-foreground'
                  )}
                >
                  {goal}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          Definí tus objetivos en el perfil para verlos acá.
        </p>
      )}
    </div>
  )
}
