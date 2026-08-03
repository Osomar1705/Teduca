'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Gift,
  Sparkles,
  Star,
  Trophy,
  Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  { key: 'balance', label: 'Mi Balance', icon: Wallet },
  { key: 'redeem', label: 'Canjear', icon: Gift },
  { key: 'ranking', label: 'Ranking', icon: Trophy },
]

export default function RewardsPage() {
  const [tab, setTab] = useState<Tab>('balance')

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Recompensas"
        description="Gana puntos por tu participación académica y canjéalos por beneficios."
      />

      <div className="mb-8 flex gap-2 overflow-x-auto">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
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
  const [balance, setBalance] = useState<RewardBalance | null>(null)
  const [transactions, setTransactions] = useState<RewardTransaction[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    setBalance(getRewardBalance())
    setTransactions(getTransactions())
  }, [])

  if (!balance) {
    return <Skeleton className="h-64 rounded-2xl" />
  }

  const rules = getEarnRules()
  const recent = showAll ? transactions : transactions.slice(0, 5)
  const empty = balance.total === 0 && transactions.length === 0

  return (
    <div className="space-y-10">
      <FadeIn>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-brand p-6 text-white shadow-lg md:p-8">
          <div className="bg-grid-light absolute inset-0" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Star className="size-4" /> {balance.label}
            </div>
            <p className="mt-2 font-mono text-5xl font-bold tracking-tight md:text-6xl">
              {balance.total}
              <span className="ml-2 text-lg font-normal text-white/70">{balance.unit}</span>
            </p>
            <div className="mt-6 flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-white/70">Esta semana</p>
                <p className="text-lg font-semibold">+{balance.weeklyEarned}</p>
              </div>
              <div>
                <p className="text-xs text-white/70">Este mes</p>
                <p className="text-lg font-semibold">+{balance.monthlyEarned}</p>
              </div>
              <div>
                <p className="text-xs text-white/70">Total ganado</p>
                <p className="text-lg font-semibold">{balance.totalEarned}</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {empty ? (
        <EmptyState
          icon={Sparkles}
          title="¡Empieza a ganar puntos!"
          description="Tu primer login ya vale 5 puntos. Asiste a mentorías y completa cursos para sumar más."
          action={
            <Button variant="brand" asChild>
              <Link href={APP_ROUTES.DISCOVER}>Descubrir profesores</Link>
            </Button>
          }
        />
      ) : (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Historial reciente
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={APP_ROUTES.REWARDS_HISTORY}>
                Ver historial completo <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <Card className="divide-y divide-border px-5 py-1">
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aún no tienes movimientos.
              </p>
            ) : (
              recent.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
            )}
          </Card>
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
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
          Cómo ganar más
        </h2>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((rule) => {
            const Icon = getEarnIcon(rule.icon)
            return (
              <StaggerItem key={rule.event}>
                <Card
                  className={cn(
                    'flex h-full flex-col p-5',
                    !rule.isActive && 'opacity-60',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    {rule.isActive ? (
                      <span className="text-sm font-bold text-primary">
                        +{rule.pointsAwarded}
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        Próximamente
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">{rule.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>
                </Card>
              </StaggerItem>
            )
          })}
        </Stagger>
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
  const [items, setItems] = useState<RewardItem[]>([])
  const [balance, setBalance] = useState<RewardBalance | null>(null)
  const [category, setCategory] = useState<RewardCategory | 'all'>('all')

  useEffect(() => {
    setItems(getMarketplaceItems())
    setBalance(getRewardBalance())
  }, [])

  const filtered = useMemo(
    () => (category === 'all' ? items : items.filter((i) => i.category === category)),
    [items, category],
  )

  return (
    <div className="space-y-6">
      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">Balance disponible</p>
          <p className="font-mono text-2xl font-bold text-foreground">
            {balance?.total ?? 0}{' '}
            <span className="text-sm font-normal text-muted-foreground">puntos</span>
          </p>
        </div>
        <Star className="size-8 text-primary" />
      </Card>

      <div className="flex gap-2 overflow-x-auto">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={cn(
              'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
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
          title="Sin recompensas en esta categoría"
          description="Prueba con otra categoría o vuelve más tarde."
        />
      ) : (
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <StaggerItem key={item.id}>
              <RewardCard
                reward={item}
                balance={balance?.total}
                onRedeem={redeemItem}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-3 border-dashed p-5">
        <div>
          <p className="font-semibold text-foreground">
            ¿Eres una empresa o universidad?
          </p>
          <p className="text-sm text-muted-foreground">
            Escríbenos para convertirte en Partner de TEDUCA.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href="mailto:partners@teduca.app">Ser Partner</a>
        </Button>
      </Card>
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
      <div className="flex gap-2 overflow-x-auto">
        {[...RANK_TABS, { key: 'friends' as RankTab, label: 'Amigos' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={cn(
              'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
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
          title="Invita compañeros para ver tu ranking entre amigos."
          description="Cuando tus amigos se unan a TEDUCA aparecerán aquí."
        />
      ) : (
        <RankingTable entries={entries} />
      )}

      <p className="text-center text-xs text-muted-foreground">
        El ranking se basa principalmente en participación académica, no solo en puntos.
      </p>
    </div>
  )
}
