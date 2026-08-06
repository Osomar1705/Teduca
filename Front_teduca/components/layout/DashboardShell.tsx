'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Bell, Search, Users, Clock } from 'lucide-react'
import { Sidebar, SidebarNav } from '@/components/layout/Sidebar'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import { APP_ROUTES, UserRole } from '@/lib/constants'
import { usePlatformStore } from '@/store/platformStore'
import { useUIStore } from '@/store/uiStore'
import { getOnboardingStatus } from '@/lib/onboarding/service'
import { getNotifications } from '@/lib/notifications/service'
import { recordDailyActivity } from '@/lib/gamification/service'
import { maybeAwardDailyLogin } from '@/lib/rewards/service'
import { getSession } from '@/lib/auth-client'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isMobileMenuOpen, setMobileMenuOpen, closeMobileMenu } = useUIStore()
  const { userRole } = usePlatformStore()
  const isPending = userRole === UserRole.TEACHER_PENDING
  // Accedemos al store directamente para el setter (no necesitamos suscripción reactiva aquí)
  const setUserRole = usePlatformStore.getState().setUserRole
  const router = useRouter()
  const [unread, setUnread] = useState(0)
  // Flag para ejecutar el efecto solo una vez por montaje
  const didInit = useRef(false)

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    recordDailyActivity()
    maybeAwardDailyLogin()

    getOnboardingStatus()
      .then((s) => { if (!s.completed) router.replace(APP_ROUTES.ONBOARDING) })
      .catch(() => {})

    getNotifications()
      .then((n) => setUnread(n.filter((x) => !x.isRead).length))
      .catch(() => {})

    // Sincronizar rol real del backend → platformStore
    getSession()
      .then((session) => {
        if (!session?.user) return
        const roles: string[] = (session.user as { roles?: { name: string }[] })
          .roles?.map((r) => r.name) ?? []
        if (roles.includes('admin'))                setUserRole(UserRole.ADMIN)
        else if (roles.includes('teacher'))         setUserRole(UserRole.TEACHER)
        else if (roles.includes('teacher_pending')) setUserRole(UserRole.TEACHER_PENDING)
        else                                        setUserRole(UserRole.STUDENT)
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-svh overflow-x-clip bg-background">
      <Sidebar />

      {/* Drawer móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 left-0 z-50 flex w-80 flex-col border-r border-border bg-sidebar md:hidden"
            >
              <div className="flex h-16 items-center justify-between px-5">
                <Logo className="h-9 w-auto" />
                <Button variant="ghost" size="icon-sm" onClick={closeMobileMenu}>
                  <X className="size-4" />
                </Button>
              </div>
              <SidebarNav onNavigate={closeMobileMenu} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="glass sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/60 px-4 md:px-6 backdrop-blur-xl">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>

          <div className="relative hidden max-w-sm flex-1 items-center sm:flex">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar..."
              className="h-10 w-full rounded-xl border border-input bg-background/80 pl-9 pr-3 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href={APP_ROUTES.COMMUNITY}>
                <Users className="size-4 text-primary" />
                Comunidad
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href={APP_ROUTES.NOTIFICATIONS}>
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
                <span className="sr-only">Notificaciones</span>
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {isPending && (
          <div className="flex items-center gap-2.5 border-b border-amber-500/20 bg-amber-500/8 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
            <Clock className="size-3.5 shrink-0" />
            <span>Tu solicitud para ser Profesor está <strong>en revisión</strong>. Te notificaremos cuando sea aprobada.</span>
            <Link href={APP_ROUTES.EVALUATION} className="ml-auto shrink-0 font-medium underline underline-offset-2 hover:opacity-80">Ver detalles</Link>
          </div>
        )}
        <main className="flex-1 px-4 py-6 md:px-6 md:py-7">{children}</main>
      </div>
    </div>
  )
}
