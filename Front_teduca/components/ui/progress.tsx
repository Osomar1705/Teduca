import { cn } from '@/lib/utils'

type ProgressColor = 'brand' | 'primary' | 'success' | 'warning'

const COLOR: Record<ProgressColor, string> = {
  brand: 'bg-gradient-brand',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
}

export function Progress({
  value,
  className,
  color = 'brand',
}: {
  value: number
  className?: string
  color?: ProgressColor
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', COLOR[color])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
