'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Gift,
  Orbit,
  Trophy,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { RewardCard } from '@/components/gamification/RewardCard'
import { RankingTable } from '@/components/rewards/RankingTable'
import { TransactionRow } from '@/components/rewards/TransactionRow'
import { getEarnIcon } from '@/components/rewards/rewardIcons'
import { APP_ROUTES } from '@/lib/constants'
import {
  getEarnRules,
  getMarketplaceItems,
  getRanking,
  getRewardBalance,
  getTransactions,
  redeemItem,
} from '@/lib/rewards/service'
import { cn } from '@/lib/utils'
import type {
  RankingData,
  RewardBalance,
  RewardCategory,
  RewardItem,
  RewardTransaction,
} from '@/lib/rewards/types'

type Tab = 'balance' | 'redeem' | 'ranking'

const TABS: { key: Tab; label: string; icon: typeof Wallet }[] = [
  { key: 'balance', label: 'Mis Orbits', icon: Wallet },
  { key: 'redeem', label: 'Tienda', icon: Gift },
  { key: 'ranking', label: 'Ranking', icon: Trophy },
]

export default function RewardsPage() {
  const [tab, setTab] = useState<Tab>('balance')

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Mis Orbits"
        description="Tus Orbits representan tu impacto y participación en TEDUCA. Ganá más siendo activo."
      />

      <div className="mb-6 flex gap-0 border-b border-border">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                '-mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'balance' && <BalanceTab />}
      {tab === 'redeem' && <RedeemTab />}
      {tab === 'ranking' && <RankingTab />}
    </div>
  )
}

function BalanceTab() {
  const [balance] = useState<RewardBalance | null>(getRewardBalance)
  const [transactions] = useState<RewardTransaction[]>(getTransactions)
  const [showAll, setShowAll] = useState(false)

  if (!balance) {
    return <Skeleton className="h-64 rounded-2xl" />
  }

  const rules = getEarnRules()
  const recent = showAll ? transactions : transactions.slice(0, 5)
  const empty = balance.total === 0 && transactions.length === 0

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 to-primary/3 p-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">
            Balance actual
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold tracking-tight text-foreground">
              {balance.total}
            </span>
            <span className="text-lg font-semibold text-primary">Orbits</span>
          </div>
          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-2xl font-semibold text-success">+{balance.weeklyEarned}</p>
              <p className="text-xs text-muted-foreground">esta semana</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-2xl font-semibold text-foreground">{balance.monthlyEarned}</p>
              <p className="text-xs text-muted-foreground">este mes</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-2xl font-semibold text-foreground">{balance.totalEarned}</p>
              <p className="text-xs text-muted-foreground">total ganado</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {empty ? (
        <EmptyState
          icon={Orbit}
          title="¡Empezá a ganar Orbits!"
          description="Tu primer login ya vale Orbits. Asistí a mentorías y completá cursos para sumar más."
          action={
            <Button variant="brand" asChild>
              <Link href={APP_ROUTES.DISCOVER}>Descubrir profesores</Link>
            </Button>
          }
        />
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Historial reciente</h2>
            <Link
              href={APP_ROUTES.REWARDS_HISTORY}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Ver todo <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border px-4">
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aún no tenés movimientos.
              </p>
            ) : (
              recent.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
            )}
          </div>
          {transactions.length > 5 && (
            <div className="mt-3 text-center">
              <Button variant="outline" size="sm" onClick={() => setShowAll((v) => !v)}>
                {showAll ? 'Ver menos' : `Ver ${transactions.length - 5} más`}
              </Button>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Cómo ganar más Orbits</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {rules.map((rule) => {
            const Icon = getEarnIcon(rule.icon)
            return (
              <div
                key={rule.event}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3 transition-colors',
                  rule.isActive
                    ? 'border-border hover:border-primary/30'
                    : 'border-border/50 opacity-60',
                )}
              >
                <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">{rule.label}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{rule.description}</p>
                </div>
                {rule.isActive ? (
                  <span className="flex-shrink-0 text-xs font-bold text-primary">
                    +{rule.pointsAwarded} <span className="font-normal">Orbits</span>
                  </span>
                ) : (
                  <Badge variant="secondary" className="flex-shrink-0 text-[10px]">
                    Pronto
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

const CATEGORIES: { key: RewardCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'food', label: 'Comida' },
  { key: 'transport', label: 'Transporte' },
  { key: 'education', label: 'Educación' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'partner', label: 'Partners' },
]

function RedeemTab() {
  const [items] = useState<RewardItem[]>(getMarketplaceItems)
  const [balance] = useState<RewardBalance | null>(getRewardBalance)
  const [category, setCategory] = useState<RewardCategory | 'all'>('all')

  const filtered = useMemo(
    () => (category === 'all' ? items : items.filter((i) => i.category === category)),
    [items, category],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-primary/5 px-5 py-4">
        <div>
          <p className="text-xs text-muted-foreground">Orbits disponibles</p>
          <p className="text-2xl font-bold text-primary">
            {balance?.total ?? 0}{' '}
            <span className="text-sm font-semibold text-primary">Orbits</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              'whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              category === c.key
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Gift}
          title="Sin ítems en esta categoría"
          description="Probá con otra categoría o volvé más tarde."
        />
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <StaggerItem key={item.id}>
              <RewardCard reward={item} balance={balance?.total} onRedeem={redeemItem} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-5">
        <div>
          <p className="text-sm font-medium text-foreground">
            ¿Sos una empresa o universidad?
          </p>
          <p className="text-xs text-muted-foreground">
            Escribinos para convertirte en Partner de TEDUCA.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="mailto:partners@teduca.app">Ser Partner</a>
        </Button>
      </div>
    </div>
  )
}

type RankTab = 'global' | 'byUniversity' | 'byCareer' | 'weekly' | 'monthly' | 'friends'

const RANK_TABS: { key: RankTab; label: string }[] = [
  { key: 'global', label: 'Global' },
  { key: 'byUniversity', label: 'Mi Universidad' },
  { key: 'byCareer', label: 'Mi Carrera' },
  { key: 'weekly', label: 'Semanal' },
  { key: 'monthly', label: 'Mensual' },
]

function RankingTab() {
  const [data, setData] = useState<RankingData | null>(null)
  const [sub, setSub] = useState<RankTab>('global')

  useEffect(() => {
    getRanking().then(setData)
  }, [])

  if (!data) {
    return <Skeleton className="h-96 rounded-xl" />
  }

  const entries =
    sub === 'friends' ? data.friends : (data[sub] as RankingData['global'])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[...RANK_TABS, { key: 'friends' as RankTab, label: 'Amigos' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={cn(
              'whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              sub === t.key
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'friends' && entries.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Invitá compañeros para ver tu ranking entre amigos."
          description="Cuando tus amigos se unan a TEDUCA aparecerán acá."
        />
      ) : (
        <RankingTable entries={entries} />
      )}

      <p className="text-center text-xs text-muted-foreground">
        El ranking se basa principalmente en participación académica y Orbits acumulados.
      </p>
    </div>
  )
}
