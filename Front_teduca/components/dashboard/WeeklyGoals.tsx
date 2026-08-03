'use client'

import { useState } from 'react'
import { Target, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'
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
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Objetivos semanales</p>
        <Target className="size-5 text-primary" />
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progreso semanal</span>
          <span>
            {weeklyXP}/{weeklyGoal} XP
          </span>
        </div>
        <Progress value={pct} />
      </div>

      {list.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {list.map((goal, i) => {
            const checked = done.has(i)
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="flex w-full items-center gap-2.5 text-left"
                >
                  <span
                    className={cn(
                      'inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                      checked
                        ? 'border-transparent bg-primary text-primary-foreground'
                        : 'border-border'
                    )}
                  >
                    {checked && <Check className="size-3.5" />}
                  </span>
                  <span
                    className={cn(
                      'text-sm',
                      checked
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground'
                    )}
                  >
                    {goal}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Definí tus objetivos en el perfil para verlos acá.
        </p>
      )}
    </Card>
  )
}
