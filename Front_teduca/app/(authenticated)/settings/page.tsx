'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Bell,
  Lock,
  Sparkles,
  Check,
  LogOut,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { authClient } from '@/lib/auth-client'

const FREE_FEATURES = [
  'Acceso a todos los cursos publicados',
  'Descubrir profesores verificados',
  'Reservá mentorías y clases',
  'Racha, XP y logros',
  'Mentor académico IA (uso básico)',
  'Notificaciones personalizadas',
]

const PREMIUM_FEATURES = [
  'Mentorías premium 1:1 ilimitadas',
  'Recomendaciones IA avanzadas',
  'Insignias y recompensas exclusivas',
  'Prioridad en matches académicos',
  'Estadísticas de participación detalladas',
]

const APP_VERSION = '1.0.0'

export default function SettingsPage() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/')
            router.refresh()
          },
        },
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Configuración</h1>

      {/* Plan actual */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="border-b border-border bg-gradient-to-r from-primary/5 to-transparent px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Plan actual</p>
              <p className="mt-0.5 text-xl font-bold text-foreground">Estudiante</p>
              <p className="text-sm text-muted-foreground">Plan gratuito</p>
            </div>
            <Badge variant="secondary" className="text-xs">Gratis</Badge>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-5 grid grid-cols-2 gap-x-8 gap-y-2">
            {FREE_FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 size-3.5 flex-shrink-0 text-success" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-muted/50 p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Crown className="size-3.5 text-warning" /> Con Premium
            </p>
            {PREMIUM_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                <Lock className="size-3.5 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          <Button className="mt-4 w-full" variant="brand">
            <Sparkles className="size-4" />
            Mejorar a Premium
          </Button>
        </div>
      </div>

      {/* Ajustes */}
      <div className="overflow-hidden rounded-xl border border-border">
        {[
          {
            Icon: Bell,
            label: 'Notificaciones',
            description: 'Gestioná tus preferencias de notificaciones',
            action: <Button variant="ghost" size="sm">Configurar</Button>,
          },
          {
            Icon: Sparkles,
            label: 'Apariencia',
            description: 'Cambiá el tema de la aplicación (claro/oscuro)',
            action: <ThemeToggle />,
          },
          {
            Icon: Lock,
            label: 'Privacidad y seguridad',
            description: 'Controlá la visibilidad de tu perfil',
            action: <Button variant="ghost" size="sm">Configurar</Button>,
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0 transition-colors hover:bg-muted/30"
          >
            <item.Icon className="size-4 flex-shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            {item.action}
          </div>
        ))}
      </div>

      {/* Cuenta */}
      <div className="rounded-xl border border-border px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Cuenta</p>
            <p className="text-xs text-muted-foreground">TEDUCA v{APP_VERSION}</p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <LogOut className="size-4" />
            {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
          </Button>
        </div>
      </div>
    </div>
  )
}
