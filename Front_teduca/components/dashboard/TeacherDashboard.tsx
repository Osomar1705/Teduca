import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { APP_ROUTES } from '@/lib/constants'
import { BookOpen, Users, FileText, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { StatsCard } from './StatsCard'

export function TeacherDashboard() {
  // TODO: Replace with actual data from TanStack Query
  const stats = {
    activeCourses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    averageCompletion: 0,
  }

  const recentCourses = []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Panel del Docente
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus cursos y estudiantes
          </p>
        </div>
        <Button asChild>
          <Link href={APP_ROUTES.CREATE_COURSE}>
            <Plus className="mr-2 h-4 w-4" />
            Crear nuevo curso
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Cursos activos"
          value={stats.activeCourses}
          icon={BookOpen}
          description="Cursos en progreso"
        />
        <StatsCard
          title="Estudiantes totales"
          value={stats.totalStudents}
          icon={Users}
          description="Inscritos en tus cursos"
        />
        <StatsCard
          title="Tareas por calificar"
          value={stats.pendingAssignments}
          icon={FileText}
          description="Pendientes de revisión"
        />
        <StatsCard
          title="Tasa de finalización"
          value={`${stats.averageCompletion}%`}
          icon={TrendingUp}
          trend={{ value: 8, direction: 'up' }}
          description="Promedio de cursos"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* My Courses */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Mis cursos
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href={APP_ROUTES.COURSES}>Ver todos</Link>
            </Button>
          </div>

          {recentCourses.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border">
              <div className="text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No has creado ningún curso aún
                </p>
                <Button asChild variant="link" className="mt-2">
                  <Link href={APP_ROUTES.CREATE_COURSE}>
                    Crear tu primer curso
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Course items will render here */}
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Acciones rápidas
          </h2>
          <div className="space-y-3">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
            >
              <Link href={APP_ROUTES.CREATE_COURSE}>
                <Plus className="mr-2 h-4 w-4" />
                Crear curso
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
            >
              <Link href={APP_ROUTES.COURSES}>
                <BookOpen className="mr-2 h-4 w-4" />
                Ver mis cursos
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
            >
              <Link href={APP_ROUTES.PROFILE}>
                <Users className="mr-2 h-4 w-4" />
                Mi perfil
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
