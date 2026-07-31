import { cn } from '@/lib/utils'

/**
 * Marca TEDUCA — monograma inspirado en el isotipo (tardígrado / oso de agua):
 * cuerpo redondeado y segmentado sobre un tile con gradiente de marca.
 * Usa `currentColor` de forma controlada; el gradiente vive dentro del propio SVG.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="TEDUCA"
      className={cn('h-9 w-9', className)}
    >
      <defs>
        <linearGradient id="teduca-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.5 0.2 264)" />
          <stop offset="55%" stopColor="oklch(0.6 0.17 250)" />
          <stop offset="100%" stopColor="oklch(0.72 0.15 232)" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#teduca-grad)" />
      {/* Cuerpo segmentado del tardígrado */}
      <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round">
        <path
          d="M13 30c0-6 3.5-10.5 9-10.5 6.5 0 11.5 3.5 14 7"
          strokeWidth="3.4"
        />
        <path d="M24 20.5c1.6 2.2 2.4 4.9 2.4 8.2" strokeWidth="2.6" opacity="0.85" />
        <path d="M30.5 21.6c1.6 2.4 2.4 5.2 2.4 8.4" strokeWidth="2.6" opacity="0.7" />
      </g>
      {/* Cabeza + patas */}
      <path
        d="M12.6 28.4c-1.9 0-3.4 1.6-3.4 3.6 0 2.6 2.1 4.4 4.9 4.4h18c2.5 0 4.2-1.3 4.2-3.3"
        fill="none"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="14.4" cy="27.6" r="1.7" fill="white" />
    </svg>
  )
}

/** Logo completo: monograma + wordmark geométrico. */
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
