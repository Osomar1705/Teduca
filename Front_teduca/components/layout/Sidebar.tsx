'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Compass,
  BookOpen,
  Heart,
  CalendarCheck,
  User,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { APP_ROUTES } from '@/lib/constants'
import { Logo, LogoMark } from '@/components/common/Logo'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const NAV: NavItem[] = [
  { label: 'Inicio', href: APP_ROUTES.DASHBOARD, icon: Home },
  { label: 'Descubrir Profesores', href: APP_ROUTES.DISCOVER, icon: Compass },
  { label: 'Cursos', href: APP_ROUTES.COURSES, icon: BookOpen },
  { label: 'Favoritos', href: APP_ROUTES.FAVORITES, icon: Heart },
  { label: 'Mis Reservas', href: APP_ROUTES.RESERVATIONS, icon: CalendarCheck },
  { label: 'Perfil', href: APP_ROUTES.PROFILE, icon: User },
  { label: 'Configuración', href: APP_ROUTES.SETTINGS, icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === APP_ROUTES.DASHBOARD) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map(({ label, href, icon: Icon }) => {
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
    </nav>
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
      <div className="mt-auto p-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 p-3">
          <LogoMark className="h-8 w-auto" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              Plan Estudiante
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Aprendé sin límites
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
