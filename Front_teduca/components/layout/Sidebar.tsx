'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  Sparkles,
  Compass,
  BookOpen,
  MessageCircle,
  CalendarCheck,
  Heart,
  BarChart3,
  Trophy,
  Gift,
  User,
  Bell,
  Settings,
  Flame,
  type LucideIcon,
} from 'lucide-react'
import { APP_ROUTES } from '@/lib/constants'
import { Logo } from '@/components/common/Logo'
import { cn } from '@/lib/utils'
import { getGamificationState } from '@/lib/gamification/service'
import type { GamificationState } from '@/lib/gamification/types'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface NavGroup {
  title?: string
  items: NavItem[]
}

const NAV: NavGroup[] = [
  {
    items: [
      { label: 'Inicio', href: APP_ROUTES.DASHBOARD, icon: Home },
      { label: 'Para Ti', href: APP_ROUTES.FOR_YOU, icon: Sparkles },
    ],
  },
  {
    title: 'Aprender',
    items: [
      { label: 'Descubrir', href: APP_ROUTES.DISCOVER, icon: Compass },
      { label: 'Cursos', href: APP_ROUTES.COURSES, icon: BookOpen },
      { label: 'Mensajes', href: APP_ROUTES.MESSAGES, icon: MessageCircle },
    ],
  },
  {
    title: 'Mi espacio',
    items: [
      { label: 'Mis Reservas', href: APP_ROUTES.RESERVATIONS, icon: CalendarCheck },
      { label: 'Favoritos', href: APP_ROUTES.FAVORITES, icon: Heart },
      { label: 'Participación', href: APP_ROUTES.PARTICIPATE, icon: BarChart3 },
      { label: 'Logros', href: APP_ROUTES.ACHIEVEMENTS, icon: Trophy },
      { label: 'Recompensas', href: APP_ROUTES.REWARDS, icon: Gift },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Perfil', href: APP_ROUTES.PROFILE, icon: User },
      { label: 'Notificaciones', href: APP_ROUTES.NOTIFICATIONS, icon: Bell },
      { label: 'Configuración', href: APP_ROUTES.SETTINGS, icon: Settings },
    ],
  },
]

function isActive(pathname: string, href: string) {
  if (href === APP_ROUTES.DASHBOARD) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-2">
      {NAV.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-1">
          {group.title && (
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </p>
          )}
          {group.items.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative size-[18px] shrink-0" />
                <span className="relative truncate">{label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

function GamificationFooter() {
  const [game, setGame] = useState<GamificationState | null>(null)

  useEffect(() => {
    setGame(getGamificationState())
  }, [])

  if (!game) return null

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card/50 p-3">
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-foreground">{game.level.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          Nivel {game.level.level} · {game.xp} XP
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 rounded-md bg-orange-500/10 px-2 py-1">
        <Flame className="size-3.5 text-orange-500" />
        <span className="text-xs font-semibold text-foreground">{game.streak.current}</span>
      </div>
    </div>
  )
}

/** Sidebar fijo para escritorio. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-16 items-center px-5">
        <Link href={APP_ROUTES.DASHBOARD} className="transition-opacity hover:opacity-80">
          <Logo className="h-9 w-auto" />
        </Link>
      </div>
      <SidebarNav />
      <div className="p-3">
        <GamificationFooter />
      </div>
    </aside>
  )
}
