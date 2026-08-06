'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { REWARD_TYPE_ICON, REWARD_TYPE_LABEL } from '@/components/rewards/rewardIcons'
import type { RewardItem } from '@/lib/rewards/types'

export function RewardCard({
  reward,
  balance,
  onRedeem,
}: {
  reward: RewardItem
  balance?: number
  onRedeem?: (id: string) => Promise<{ success: boolean; message: string }>
}) {
  const Icon = REWARD_TYPE_ICON[reward.type]
  const locked = reward.status === 'locked'
  const claimed = reward.status === 'claimed'
  const [message, setMessage] = useState<string | null>(null)
  const [showConditions, setShowConditions] = useState(false)

  const affordable = balance === undefined || balance >= reward.value

  async function handleRedeem() {
    if (!onRedeem) return
    const res = await onRedeem(reward.id)
    setMessage(res.message)
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-200 hover:-translate-y-px hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'inline-flex size-11 items-center justify-center rounded-2xl ring-1 ring-inset',
            locked ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant="outline">{REWARD_TYPE_LABEL[reward.type]}</Badge>
          {reward.featured && <Badge variant="warning">Destacado</Badge>}
        </div>
      </div>

      <h3 className="mt-3 font-semibold text-foreground">{reward.name}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{reward.description}</p>
      {reward.partner && (
        <p className="mt-2 text-xs text-muted-foreground">Aliado: {reward.partner}</p>
      )}

      {showConditions && reward.conditions.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          {reward.conditions.map((c) => (
            <li key={c}>• {c}</li>
          ))}
        </ul>
      )}

      {message && (
        <p className="mt-3 rounded-lg bg-primary/5 p-2 text-xs text-primary">{message}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <span className="text-lg font-bold text-foreground">{reward.displayValue}</span>
        {locked ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3.5" /> Próximamente
          </span>
        ) : claimed ? (
          <Badge variant="secondary">Canjeado</Badge>
        ) : onRedeem ? (
          <div className="flex gap-2">
            {reward.conditions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConditions((v) => !v)}
              >
                Condiciones
              </Button>
            )}
            <Button
              variant="brand"
              size="sm"
              disabled={!affordable}
              onClick={handleRedeem}
            >
              {affordable ? 'Canjear' : 'Insuficiente'}
            </Button>
          </div>
        ) : (
          <Badge variant="success">Disponible</Badge>
        )}
      </div>
    </div>
  )
}
