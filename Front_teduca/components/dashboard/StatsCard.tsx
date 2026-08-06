import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  description?: string
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: StatsCardProps) {
  return (
    <Card className="surface-card-hover p-5 sm:p-6 hover:border-primary/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="font-mono text-[2rem] font-bold tracking-tight text-foreground sm:text-3xl">
              {value}
            </p>
            {trend && (
              <span
                className={`text-sm font-semibold ${
                  trend.direction === 'up' ? 'text-success' : 'text-destructive'
                }`}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  )
}
