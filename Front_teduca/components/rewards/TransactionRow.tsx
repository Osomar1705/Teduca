'use client'

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RewardTransaction } from '@/lib/rewards/types'

export function TransactionRow({ tx }: { tx: RewardTransaction }) {
  const earned = tx.type === 'earned'
  const Icon = earned ? ArrowUpRight : ArrowDownRight

  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className={cn(
          'inline-flex size-9 shrink-0 items-center justify-center rounded-full',
          earned ? 'bg-success/12 text-success' : 'bg-destructive/12 text-destructive',
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{tx.description}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(tx.createdAt).toLocaleTimeString('es', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            'font-mono text-sm font-semibold',
            earned ? 'text-success' : 'text-destructive',
          )}
        >
          {earned ? '+' : '−'}
          {Math.abs(tx.points)}
        </p>
        <p className="text-xs text-muted-foreground">{tx.balance} Orbits</p>
      </div>
    </div>
  )
}
