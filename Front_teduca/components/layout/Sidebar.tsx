'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Home, Users, Compass, BookOpen, MessageCircle, CalendarCheck,
  Heart, BarChart3, Trophy, Gift, User, Bell, Settings, Flame,
  LayoutDashboard, GraduationCap, CalendarDays, LineChart, UserSquare2,
  type LucideIcon,
} from 'lucide-react'

import { APP_ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getGamificationState } from '@/lib/gamification/service'
import type { GamificationState } from '@/lib/gamification/types'
import { PlatformSwitcher } from './PlatformSwitcher'
import { usePlatformStore } from '@/store/platformStore'

// ── Tipos ──────────────────────────────────────────────────────────────────

interface NavItem  { label: string; href: string; icon: LucideIcon }
interface NavGroup { title?: string; items: NavItem[] }

// ── Navegación ALUMNO ──────────────────────────────────────────────────────

const NAV_ALUMNO: NavGroup[] = [
  {
    items: [
      { label: 'Inicio',     href: APP_ROUTES.DASHBOARD,  icon: Home  },
      { label: 'Comunidad',  href: APP_ROUTES.COMMUNITY,  icon: Users },
    ],
  },
  {
    title: 'Aprender',
    items: [
      { label: 'Descubrir', href: APP_ROUTES.DISCOVER,  icon: Compass       },
      { label: 'Cursos',    href: APP_ROUTES.COURSES,   icon: BookOpen      },
      { label: 'Mensajes',  href: APP_ROUTES.MESSAGES,  icon: MessageCircle },
    ],
  },
  {
    title: 'Mi espacio',
    items: [
      { label: 'Mis Reservas',  href: APP_ROUTES.RESERVATIONS, icon: CalendarCheck },
      { label: 'Favoritos',     href: APP_ROUTES.FAVORITES,    icon: Heart         },
      { label: 'Participación', href: APP_ROUTES.PARTICIPATE,  icon: BarChart3     },
      { label: 'Logros',        href: APP_ROUTES.ACHIEVEMENTS, icon: Trophy        },
      { label: 'Orbits',        href: APP_ROUTES.REWARDS,      icon: Gift          },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Perfil',          href: APP_ROUTES.PROFILE,       icon: User     },
      { label: 'Notificaciones',  href: APP_ROUTES.NOTIFICATIONS,  icon: Bell     },
      { label: 'Configuración',   href: APP_ROUTES.SETTINGS,       icon: Settings },
    ],
  },
]

// ── Navegación PROFESOR ────────────────────────────────────────────────────

const NAV_PROFESOR: NavGroup[] = [
  {
    items: [
      { label: 'Dashboard',  href: APP_ROUTES.TEACHER,           icon: LayoutDashboard },
      { label: 'Comunidad',  href: APP_ROUTES.COMMUNITY,         icon: Users           },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Mis Alumnos', href: APP_ROUTES.TEACHER_STUDENTS, icon: GraduationCap },
      { label: 'Mis Cursos',  href: APP_ROUTES.TEACHER_COURSES,  icon: BookOpen      },
      { label: 'Agenda',      href: APP_ROUTES.TEACHER_CALENDAR, icon: CalendarDays  },
      { label: 'Estadísticas',href: APP_ROUTES.TEACHER_STATS,    icon: LineChart     },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Mi perfil',      href: '/teacher/profile',        icon: UserSquare2 },
      { label: 'Notificaciones', href: APP_ROUTES.NOTIFICATIONS, icon: Bell        },
      { label: 'Configuración',  href: APP_ROUTES.SETTINGS,      icon: Settings    },
    ],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string) {
  if (href === APP_ROUTES.DASHBOARD || href === APP_ROUTES.TEACHER) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

// ── SidebarNav ─────────────────────────────────────────────────────────────

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { mode } = usePlatformStore()
  const nav = mode === 'profesor' ? NAV_PROFESOR : NAV_ALUMNO

  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-2.5 py-2">
      {nav.map((group, gi) => (
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

// ── GamificationFooter ─────────────────────────────────────────────────────

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

// ── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
      {/* PlatformSwitcher reemplaza el logo */}
      <div className="flex h-14 items-center px-3">
        <PlatformSwitcher />
      </div>

      <SidebarNav />

      <div className="border-t border-border/60 px-2 py-1.5">
        <GamificationFooter />
      </div>
    </aside>
  )
}
