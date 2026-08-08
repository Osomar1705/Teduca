'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowDownRight, ArrowUpRight, Receipt, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { TransactionRow } from '@/components/rewards/TransactionRow'
import { APP_ROUTES } from '@/lib/constants'
import { getRewardBalance, getTransactionsAsync } from '@/lib/rewards/service'
import { cn } from '@/lib/utils'
import type { RewardBalance, RewardTransaction } from '@/lib/rewards/types'

type Filter = 'all' | 'earned' | 'redeemed' | 'month' | 'week'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'earned', label: 'Ganados' },
  { key: 'redeemed', label: 'Canjeados' },
  { key: 'month', label: 'Este mes' },
  { key: 'week', label: 'Esta semana' },
]

export default function RewardsHistoryPage() {
  const [balance, setBalance] = useState<RewardBalance | null>(null)
  const [transactions, setTransactions] = useState<RewardTransaction[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [now] = useState(() => Date.now())

  useEffect(() => {
    getRewardBalance().then(setBalance).catch(() => {})
    getTransactionsAsync().then(setTransactions).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (filter === 'earned') return t.type === 'earned'
      if (filter === 'redeemed') return t.type === 'redeemed'
      if (filter === 'week') return new Date(t.createdAt).getTime() >= now - 7 * 86_400_000
      if (filter === 'month') return new Date(t.createdAt).getTime() >= now - 30 * 86_400_000
      return true
    })
  }, [transactions, filter, now])

  const grouped = useMemo(() => {
    const map = new Map<string, RewardTransaction[]>()
    for (const tx of filtered) {
      const day = new Date(tx.createdAt).toLocaleDateString('es', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
      const list = map.get(day) ?? []
      list.push(tx)
      map.set(day, list)
    }
    return [...map.entries()]
  }, [filtered])

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Mis Orbits"
        description="Todos tus movimientos de Orbits, como una billetera digital."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={APP_ROUTES.REWARDS}>
              <ArrowLeft className="size-4" /> Volver
            </Link>
          </Button>
        }
      />

      {!balance ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<ArrowUpRight className="size-5 text-success" />}
            label="Orbits ganados"
            value={balance.totalEarned}
          />
          <StatCard
            icon={<ArrowDownRight className="size-5 text-destructive" />}
            label="Orbits usados"
            value={balance.totalRedeemed}
          />
          <StatCard
            icon={<Wallet className="size-5 text-primary" />}
            label="Orbits actuales"
            value={balance.total}
          />
        </div>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={cn(
              'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
              filter === f.key
                ? 'border-transparent bg-primary text-primary-foreground shadow-xs'
                : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!balance ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Sin movimientos"
          description="Aún no tenés Orbits para este filtro."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, txs]) => (
            <div key={day}>
              <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                {day}
              </p>
              <Card className="divide-y divide-border px-5 py-1">
                {txs.map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="inline-flex size-10 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-mono text-xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  )
}
