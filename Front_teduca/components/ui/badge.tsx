import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20',
        solid:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success:
          'border-transparent bg-success/12 text-success hover:bg-success/18 dark:bg-success/20',
        warning:
          'border-transparent bg-warning/15 text-warning-foreground hover:bg-warning/22 dark:bg-warning/25 dark:text-warning',
        info:
          'border-transparent bg-info/12 text-info hover:bg-info/18 dark:bg-info/20',
        destructive:
          'border-transparent bg-destructive/12 text-destructive hover:bg-destructive/18 dark:bg-destructive/20',
        outline: 'border-border text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
