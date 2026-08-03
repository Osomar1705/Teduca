'use client'

import {
  Gift,
  Percent,
  Coffee,
  Bus,
  ShoppingBag,
  Sparkles,
  Lock,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Reward, RewardType } from '@/lib/rewards/types'

const TYPE_ICON: Record<RewardType, LucideIcon> = {
  points: Gift,
  discount: Percent,
  food: Coffee,
  transport: Bus,
  merchandise: ShoppingBag,
  benefit: Sparkles,
}

const TYPE_LABEL: Record<RewardType, string> = {
  points: 'Puntos',
  discount: 'Descuento',
  food: 'Alimentos',
  transport: 'Transporte',
  merchandise: 'Merchandising',
  benefit: 'Beneficio',
}

export function RewardCard({ reward }: { reward: Reward }) {
  const Icon = TYPE_ICON[reward.type]
  const locked = reward.status === 'locked'
  const claimed = reward.status === 'claimed'

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            'inline-flex size-11 items-center justify-center rounded-xl',
            locked ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="size-5" />
        </div>
        <Badge variant="outline">{TYPE_LABEL[reward.type]}</Badge>
      </div>

      <h3 className="mt-3 font-semibold text-foreground">{reward.name}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{reward.description}</p>
      {reward.partner && (
        <p className="mt-2 text-xs text-muted-foreground">Aliado: {reward.partner}</p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-lg font-bold text-foreground">
          {reward.value}
          <span className="ml-1 text-xs font-normal text-muted-foreground">{reward.unit}</span>
        </span>
        {reward.status === 'available' && (
          <Badge variant="success">Disponible</Badge>
        )}
        {claimed && <Badge variant="secondary">Canjeado</Badge>}
        {locked && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3.5" /> Próximamente
          </span>
        )}
        {reward.status === 'expired' && <Badge variant="destructive">Expirado</Badge>}
      </div>
    </div>
  )
}
