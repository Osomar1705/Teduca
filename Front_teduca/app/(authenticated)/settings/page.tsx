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
import { Card } from '@/components/ui/card'
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
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Configuración</h1>

      {/* Plan actual */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-brand p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Tu plan</p>
              <h2 className="text-2xl font-bold">Plan Estudiante</h2>
            </div>
            <Badge className="bg-white/20 text-white">Gratis</Badge>
          </div>
          <p className="mt-1 text-sm text-white/80">Próxima renovación: N/A — Plan gratuito</p>
        </div>
        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">Incluido</p>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Crown className="size-4 text-warning" /> Premium
            </p>
            <ul className="space-y-2">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Lock className="mt-0.5 size-4 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="brand" className="mt-4 w-full">
              <Sparkles className="size-4" />
              Mejorar a Premium
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <SettingRow
        icon={<Bell className="mt-1 size-6 text-muted-foreground" />}
        title="Notificaciones"
        description="Gestioná tus preferencias de notificaciones"
        action={<Button variant="outline">Configurar</Button>}
      />

      {/* Appearance */}
      <SettingRow
        icon={<Sparkles className="mt-1 size-6 text-muted-foreground" />}
        title="Apariencia"
        description="Cambiá el tema de la aplicación (claro/oscuro)"
        action={<ThemeToggle />}
      />

      {/* Privacy */}
      <SettingRow
        icon={<Lock className="mt-1 size-6 text-muted-foreground" />}
        title="Privacidad y seguridad"
        description="Controlá la visibilidad de tu perfil"
        action={<Button variant="outline">Configurar</Button>}
      />

      {/* Account */}
      <Card className="space-y-4 border-destructive/20 p-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cuenta</h2>
          <p className="text-sm text-muted-foreground">TEDUCA v{APP_VERSION}</p>
        </div>
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="destructive"
          className="gap-2"
        >
          <LogOut className="size-4" />
          {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </Button>
      </Card>
    </div>
  )
}

function SettingRow({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon}
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
    </Card>
  )
}
