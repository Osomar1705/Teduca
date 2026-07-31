'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Bell, Search } from 'lucide-react'
import { Sidebar, SidebarNav } from '@/components/layout/Sidebar'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Logo } from '@/components/common/Logo'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/lib/constants'
import { useUIStore } from '@/store/uiStore'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isMobileMenuOpen, setMobileMenuOpen, closeMobileMenu } = useUIStore()

  return (
    <div className="flex min-h-svh bg-background">
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
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar md:hidden"
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
        <header className="glass sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/60 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>

          <div className="relative hidden max-w-sm flex-1 items-center sm:flex">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar profesores o cursos..."
              className="h-9 w-full rounded-lg border border-input bg-background/60 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" />
              <span className="sr-only">Notificaciones</span>
            </Button>
            <ThemeToggle />
            <Button variant="brand" size="sm" asChild className="ml-1">
              <Link href={APP_ROUTES.DISCOVER}>Descubrir</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
