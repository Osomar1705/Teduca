'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, User, Calendar, Edit } from 'lucide-react'

export default function ProfilePage() {
  // TODO: Fetch user profile from useAuth hook
  const user = null

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Mi perfil</h1>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Editar perfil
        </Button>
      </div>

      <Card className="p-8">
        <div className="space-y-8">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Usuario Ejemplo
              </h2>
              <div className="flex gap-2 mt-2">
                <Badge>Estudiante</Badge>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-4 border-t border-border pt-8">
            <div className="flex items-center gap-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Correo</p>
                <p className="font-medium text-foreground">usuario@ejemplo.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nombre completo</p>
                <p className="font-medium text-foreground">Usuario Ejemplo</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Se unió</p>
                <p className="font-medium text-foreground">
                  {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
