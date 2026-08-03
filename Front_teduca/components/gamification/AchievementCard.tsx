'use client'

import {
  Award,
  Lock,
  Trophy,
  Flame,
  Hammer,
  Users,
  Star,
  Sparkles,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Achievement } from '@/lib/gamification/types'

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  flame: Flame,
  hammer: Hammer,
  users: Users,
  star: Star,
  sparkles: Sparkles,
  graduation: GraduationCap,
  award: Award,
}

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = ICONS[achievement.icon] ?? Award
  const unlocked = achievement.unlockedAt != null

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 transition-colors',
        unlocked ? 'border-primary/20 bg-primary/5' : 'border-border bg-card'
      )}
    >
      <div
        className={cn(
          'flex size-10 flex-shrink-0 items-center justify-center rounded-xl',
          unlocked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground/60'
        )}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={cn(
              'text-sm font-semibold',
              unlocked ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {achievement.title}
          </h3>
          {!unlocked && (
            <Lock className="size-3.5 flex-shrink-0 text-muted-foreground" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{achievement.description}</p>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span
            className={cn(
              'font-semibold',
              unlocked ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            +{achievement.xpReward} XP
          </span>
          {unlocked && achievement.unlockedAt && (
            <span className="text-muted-foreground">{formatDate(achievement.unlockedAt)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
