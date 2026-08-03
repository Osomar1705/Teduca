'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getEarnIcon } from '@/components/rewards/rewardIcons'
import { APP_ROUTES } from '@/lib/constants'
import { getEarnRules, getRewardBalance } from '@/lib/rewards/service'
import type { EarnRule, RewardBalance } from '@/lib/rewards/types'

export function RewardSummaryWidget() {
  const [balance, setBalance] = useState<RewardBalance | null>(null)
  const [nextRule, setNextRule] = useState<EarnRule | null>(null)

  useEffect(() => {
    setBalance(getRewardBalance())
    setNextRule(getEarnRules().find((r) => r.isActive) ?? null)
  }, [])

  if (!balance) return <Skeleton className="h-44 rounded-xl" />

  const NextIcon = nextRule ? getEarnIcon(nextRule.icon) : Star

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Recompensas</p>
        <Star className="size-5 text-primary" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
          {balance.total}
        </span>
        <span className="text-sm text-muted-foreground">puntos ⭐</span>
      </div>
      <p className="mt-1 text-xs text-success">
        +{balance.weeklyEarned} esta semana
      </p>

      {nextRule && (
        <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-muted/50 p-2.5">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <NextIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{nextRule.label}</p>
            <p className="text-xs text-muted-foreground">+{nextRule.pointsAwarded} puntos</p>
          </div>
        </div>
      )}

      <Button variant="outline" size="sm" asChild className="mt-4 w-full">
        <Link href={APP_ROUTES.REWARDS}>
          Ver rewards <ArrowUpRight className="size-4" />
        </Link>
      </Button>
    </Card>
  )
}
