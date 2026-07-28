'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { Bell, Lock, Eye, LogOut } from 'lucide-react'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

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
    <div className="max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Configuración</h1>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Bell className="h-6 w-6 text-muted-foreground mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Notificaciones
              </h2>
              <p className="text-sm text-muted-foreground">
                Gestiona tus preferencias de notificaciones
              </p>
            </div>
          </div>
          <Button variant="outline">Configurar</Button>
        </div>
      </Card>

      {/* Privacy */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Lock className="h-6 w-6 text-muted-foreground mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Privacidad y seguridad
              </h2>
              <p className="text-sm text-muted-foreground">
                Controla la visibilidad de tu perfil
              </p>
            </div>
          </div>
          <Button variant="outline">Configurar</Button>
        </div>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Eye className="h-6 w-6 text-muted-foreground mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Apariencia
              </h2>
              <p className="text-sm text-muted-foreground">
                Cambia el tema de la aplicación (claro/oscuro)
              </p>
            </div>
          </div>
          <Button variant="outline">Configurar</Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-destructive/20">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-destructive">
            Zona de peligro
          </h2>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="destructive"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
