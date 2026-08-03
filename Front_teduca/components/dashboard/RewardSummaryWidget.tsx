'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { APP_ROUTES } from '@/lib/constants'
import { getRewardBalance } from '@/lib/rewards/service'
import type { RewardBalance } from '@/lib/rewards/types'

export function RewardSummaryWidget() {
  const [balance, setBalance] = useState<RewardBalance | null>(null)

  useEffect(() => {
    setBalance(getRewardBalance())
  }, [])

  if (!balance) return <Skeleton className="h-24 rounded-xl" />

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Balance</span>
        <Link
          href={APP_ROUTES.REWARDS}
          className="text-xs text-primary hover:underline"
        >
          Ver todo
        </Link>
      </div>
      <p className="mt-1 text-2xl font-bold text-primary">{balance.total}</p>
      <p className="text-xs text-muted-foreground">{balance.label}</p>
      {balance.weeklyEarned > 0 && (
        <p className="mt-1 text-xs text-success">+{balance.weeklyEarned} esta semana</p>
      )}
    </div>
  )
}
