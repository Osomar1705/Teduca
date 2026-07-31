import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Logo principal TEDUCA — lockup oficial completo (tardígrado + wordmark),
 * recortado con fondo transparente desde el logo original.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/teduca-logo.png"
      alt="TEDUCA"
      width={944}
      height={576}
      priority
      className={cn('h-10 w-auto object-contain', className)}
    />
  )
}

/**
 * Solo el isotipo (tardígrado), para espacios compactos o superficies donde
 * el wordmark no entra.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/teduca-mark.png"
      alt="TEDUCA"
      width={579}
      height={398}
      className={cn('h-9 w-auto object-contain', className)}
    />
  )
}
