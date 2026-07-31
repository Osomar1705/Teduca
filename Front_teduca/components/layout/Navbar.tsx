'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/common/Logo'
import { Menu } from 'lucide-react'
import { APP_ROUTES } from '@/lib/constants'
import { useUIStore } from '@/store/uiStore'

export function Navbar() {
  const { toggleSidebar } = useUIStore()

  return (
    <nav className="glass sticky top-0 z-40 w-full border-b border-border/60">
      <div className="flex h-16 items-center justify-between px-4">
        {/* Left side: Logo and toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9 md:hidden"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>

          <Link
            href={APP_ROUTES.HOME}
            className="transition-opacity hover:opacity-80"
          >
            <Logo />
          </Link>
        </div>

        {/* Right side: Theme toggle and user menu */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="brand" size="sm" asChild>
            <Link href={APP_ROUTES.LOGIN}>Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
