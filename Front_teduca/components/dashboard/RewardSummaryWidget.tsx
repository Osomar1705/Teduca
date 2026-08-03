'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Orbit } from 'lucide-react'
import { APP_ROUTES } from '@/lib/constants'
import { getRewardBalance } from '@/lib/rewards/service'
import type { RewardBalance } from '@/lib/rewards/types'

export function RewardSummaryWidget() {
  const [balance] = useState<RewardBalance | null>(getRewardBalance)

  if (!balance) {
    return (
      <div className="animate-pulse rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="mb-3 h-3 w-16 rounded bg-primary/20" />
        <div className="mb-2 h-8 w-24 rounded bg-primary/20" />
        <div className="h-3 w-32 rounded bg-muted" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-muted/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Orbit className="size-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Orbits</span>
        </div>
        <Link
          href={APP_ROUTES.REWARDS}
          className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
        >
          Ver todo <ArrowUpRight className="size-3" />
        </Link>
      </div>

      <p className="text-3xl font-bold tracking-tight text-foreground">
        {balance.total}
        <span className="ml-1.5 text-base font-semibold text-primary">Orbits</span>
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-primary/10 pt-3">
        <div>
          <p className="text-[10px] text-muted-foreground">Esta semana</p>
          <p className="text-sm font-semibold text-foreground">
            +{balance.weeklyEarned}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Este mes</p>
          <p className="text-sm font-semibold text-foreground">
            +{balance.monthlyEarned}
          </p>
        </div>
      </div>
    </div>
  )
}
