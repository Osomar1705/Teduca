'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { APP_ROUTES } from '@/lib/constants'
import { useUIStore } from '@/store/uiStore'

export function Navbar() {
  const { toggleSidebar } = useUIStore()

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
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

          <Link href={APP_ROUTES.HOME} className="flex items-center gap-2 font-bold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              T
            </div>
            <span className="hidden sm:inline">TEDUCA</span>
          </Link>
        </div>

        {/* Right side: Theme toggle and user menu */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="default" size="sm" asChild>
            <Link href={APP_ROUTES.LOGIN}>Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
