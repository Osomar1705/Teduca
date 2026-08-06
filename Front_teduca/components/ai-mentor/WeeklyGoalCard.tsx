import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { WeeklyGoal } from '@/lib/ai-mentor/types'

interface Props {
  weeklyGoal: WeeklyGoal
}

export function WeeklyGoalCard({ weeklyGoal }: Props) {
  const { title, description, progress, completed, xpReward } = weeklyGoal

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">Objetivo semanal</CardTitle>
          {completed && (
            <Badge variant="success" className="shrink-0 text-xs">
              Completado · +{xpReward} XP
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                completed ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {!completed && (
          <p className="text-xs text-muted-foreground">
            Completalo para ganar <span className="font-medium text-foreground">+{xpReward} XP</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
