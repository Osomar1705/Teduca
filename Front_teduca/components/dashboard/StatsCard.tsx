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
    <Card className="p-6 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="font-mono text-3xl font-bold tracking-tight text-foreground">
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
        <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </Card>
  )
}
