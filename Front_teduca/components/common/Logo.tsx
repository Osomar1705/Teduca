import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Marca TEDUCA — tardígrado (oso de agua) del isotipo oficial, recortado con
 * fondo transparente desde el logo original.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/teduca-mark.png"
      alt="TEDUCA"
      width={579}
      height={398}
      priority
      className={cn('h-9 w-auto object-contain', className)}
    />
  )
}

/** Logo completo: tardígrado + wordmark geométrico. */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          TEDUCA
        </span>
      )}
    </span>
  )
}
