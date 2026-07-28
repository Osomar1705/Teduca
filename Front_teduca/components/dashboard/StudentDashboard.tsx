import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { APP_ROUTES } from '@/lib/constants'
import { BookOpen, CheckSquare, Award, TrendingUp, ArrowRight } from 'lucide-react'
import { StatsCard } from './StatsCard'

export function StudentDashboard() {
  // TODO: Replace with actual data from TanStack Query
  const stats = {
    enrolledCourses: 0,
    pendingAssignments: 0,
    averageGrade: '-',
    progress: 0,
  }

  const recentCourses = []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Mi Panel de Estudiante
          </h1>
          <p className="text-muted-foreground">
            Continúa aprendiendo y alcanza tus objetivos
          </p>
        </div>
        <Button asChild>
          <Link href={APP_ROUTES.COURSES}>
            Explorar cursos
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Cursos inscritos"
          value={stats.enrolledCourses}
          icon={BookOpen}
          description="Activos en este semestre"
        />
        <StatsCard
          title="Tareas pendientes"
          value={stats.pendingAssignments}
          icon={CheckSquare}
          description="Próximos entregas"
        />
        <StatsCard
          title="Calificación promedio"
          value={stats.averageGrade}
          icon={Award}
          description="De todos tus cursos"
        />
        <StatsCard
          title="Progreso general"
          value={`${stats.progress}%`}
          icon={TrendingUp}
          trend={{ value: 5, direction: 'up' }}
          description="En la plataforma"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Courses */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">
              Mis cursos activos
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
                  No estás inscrito en ningún curso aún
                </p>
                <Button asChild variant="link" className="mt-2">
                  <Link href={APP_ROUTES.COURSES}>
                    Buscar cursos disponibles
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

        {/* Quick Links */}
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
              <Link href={APP_ROUTES.COURSES}>
                <BookOpen className="mr-2 h-4 w-4" />
                Buscar cursos
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
            >
              <Link href={APP_ROUTES.PROFILE}>
                <Award className="mr-2 h-4 w-4" />
                Mi perfil
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
            >
              <Link href={APP_ROUTES.SETTINGS}>
                <TrendingUp className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
