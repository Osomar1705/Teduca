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
        'relative overflow-hidden rounded-xl border p-5 transition-colors',
        unlocked
          ? 'border-transparent bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-card'
      )}
    >
      {!unlocked && (
        <span className="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="size-3.5" />
        </span>
      )}
      <div
        className={cn(
          'inline-flex size-12 items-center justify-center rounded-xl',
          unlocked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground/60'
        )}
      >
        <Icon className="size-6" />
      </div>
      <h3
        className={cn(
          'mt-3 font-semibold',
          unlocked ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {achievement.title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={cn('font-semibold', unlocked ? 'text-primary' : 'text-muted-foreground')}>
          +{achievement.xpReward} XP
        </span>
        {unlocked && achievement.unlockedAt && (
          <span className="text-muted-foreground">{formatDate(achievement.unlockedAt)}</span>
        )}
      </div>
    </div>
  )
}
