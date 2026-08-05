'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  Users,
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
      { label: 'Comunidad', href: APP_ROUTES.COMMUNITY, icon: Users },
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
      { label: 'Orbits', href: APP_ROUTES.REWARDS, icon: Gift },
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
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-2.5 py-2">
      {NAV.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-0.5">
          {group.title && (
            <p className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
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
                  'group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                  active
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-md bg-primary/8"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative size-[15px] shrink-0" />
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
  const [game] = useState<GamificationState | null>(getGamificationState)

  if (!game) return null

  return (
    <div className="flex items-center gap-2 px-2.5 py-2 text-xs text-muted-foreground">
      <Flame className="size-3.5 text-orange-500" />
      <span>{game.streak.current} días</span>
      <span className="mx-1 text-border">·</span>
      <span className="truncate">{game.level.title}</span>
    </div>
  )
}

/** Sidebar fijo para escritorio. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      <div className="flex h-14 items-center px-4">
        <Link href={APP_ROUTES.DASHBOARD} className="transition-opacity hover:opacity-80">
          <Logo className="h-8 w-auto" />
        </Link>
      </div>
      <SidebarNav />
      <div className="border-t border-border/60 px-2 py-1.5">
        <GamificationFooter />
      </div>
    </aside>
  )
}
