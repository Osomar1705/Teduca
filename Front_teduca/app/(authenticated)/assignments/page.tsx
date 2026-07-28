'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function AssignmentsPage() {
  // TODO: Fetch assignments from TanStack Query
  const assignments: any[] = []
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-accent" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive">Pendiente</Badge>
      case 'submitted':
        return <Badge>Enviado</Badge>
      case 'graded':
        return <Badge variant="secondary">Calificado</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mis tareas</h1>
        <p className="text-muted-foreground">
          Gestiona tus asignaciones y entregas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'submitted', 'graded'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            size="sm"
          >
            {f === 'all' && 'Todas'}
            {f === 'pending' && 'Pendientes'}
            {f === 'submitted' && 'Enviadas'}
            {f === 'graded' && 'Calificadas'}
          </Button>
        ))}
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CheckCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              No tienes tareas
            </p>
            <p className="text-sm text-muted-foreground">
              Aquí aparecerán tus asignaciones cuando se publiquen nuevas
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment: any) => (
            <Card key={assignment.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">
                      {assignment.title}
                    </h3>
                    {getStatusBadge(assignment.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {assignment.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Vence:{' '}
                    {new Date(assignment.dueDate).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <Button
                  variant={
                    assignment.status === 'pending' ? 'default' : 'outline'
                  }
                >
                  {assignment.status === 'pending' && 'Enviar'}
                  {assignment.status === 'submitted' && 'Ver envío'}
                  {assignment.status === 'graded' && 'Ver calificación'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
