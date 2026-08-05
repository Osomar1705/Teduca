'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, GraduationCap, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePlatformStore, type PlatformMode } from '@/store/platformStore'
import { APP_ROUTES } from '@/lib/constants'

// ── Definición de plataformas ───────────────────────────────────────────────

const PLATFORMS: {
  mode: PlatformMode
  label: string
  description: string
  logo: string
  color: string
  accent: string
}[] = [
  {
    mode:        'alumno',
    label:       'TEDUCA Alumno',
    description: 'Aprende, descubre cursos y participa en la comunidad.',
    logo:        '/teduca-alumno.jpeg',
    color:       'from-blue-500/10 to-indigo-500/5',
    accent:      'bg-blue-500',
  },
  {
    mode:        'profesor',
    label:       'TEDUCA Profesor',
    description: 'Enseña, administra mentorías y construye tu reputación.',
    logo:        '/teduca-profesor.jpeg',
    color:       'from-amber-500/10 to-orange-500/5',
    accent:      'bg-amber-500',
  },
]

// ── Componente ──────────────────────────────────────────────────────────────

export function PlatformSwitcher() {
  const router          = useRouter()
  const { mode, setMode, canAccessTeacher } = usePlatformStore()
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)

  const current = PLATFORMS.find((p) => p.mode === mode)!

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSelect(p: typeof PLATFORMS[0]) {
    if (p.mode === mode) { setOpen(false); return }

    const result = setMode(p.mode)
    setOpen(false)

    if (result === 'restricted') {
      router.push(APP_ROUTES.BECOME_TEACHER)
      return
    }

    // Redirigir a la raíz de la plataforma elegida
    router.push(p.mode === 'profesor' ? APP_ROUTES.TEACHER : APP_ROUTES.DASHBOARD)
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted/70',
          open && 'bg-muted/70'
        )}
      >
        {/* Logo */}
        <div className="relative size-7 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted">
          <Image src={current.logo} alt={current.label} fill className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold leading-none text-foreground">{current.label}</p>
        </div>

        <ChevronDown className={cn(
          'size-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
          open && 'rotate-180'
        )} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-full z-50 mt-1.5 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/10"
          >
            {/* Header del dropdown */}
            <div className="border-b border-border/60 px-3.5 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cambiar plataforma
              </p>
            </div>

            {/* Opciones */}
            <div className="p-1.5 space-y-0.5">
              {PLATFORMS.map((p) => {
                const isActive     = p.mode === mode
                const isTeacher    = p.mode === 'profesor'
                const isLocked     = isTeacher && !canAccessTeacher()

                return (
                  <motion.button
                    key={p.mode}
                    onClick={() => handleSelect(p)}
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.1 }}
                    className={cn(
                      'relative flex w-full items-start gap-3 overflow-hidden rounded-lg px-3 py-2.5 text-left transition-colors',
                      isActive
                        ? 'bg-primary/8 ring-1 ring-primary/20'
                        : 'hover:bg-muted/70'
                    )}
                  >
                    {/* Gradiente de fondo sutil */}
                    <div className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-60',
                      isActive ? p.color : 'from-transparent to-transparent'
                    )} />

                    {/* Logo */}
                    <div className="relative z-10 size-9 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted shadow-sm">
                      <Image src={p.logo} alt={p.label} fill className="object-cover" />
                    </div>

                    {/* Texto */}
                    <div className="relative z-10 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          'text-sm font-semibold leading-tight',
                          isActive ? 'text-foreground' : 'text-foreground/80'
                        )}>
                          {p.label}
                        </span>
                        {isLocked && (
                          <Lock className="size-3 text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {isLocked
                          ? 'Requiere evaluación. Toca para saber más.'
                          : p.description}
                      </p>
                    </div>

                    {/* Check activo */}
                    {isActive && (
                      <div className="relative z-10 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary">
                        <Check className="size-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-border/60 px-3.5 py-2">
              <p className="text-[10px] text-muted-foreground">
                {canAccessTeacher()
                  ? 'Puedes cambiar entre plataformas libremente.'
                  : 'Para acceder a TEDUCA Profesor, solicita una evaluación.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
