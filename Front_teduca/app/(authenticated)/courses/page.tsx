'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CourseCard } from '@/components/courses/CourseCard'
import Link from 'next/link'
import { APP_ROUTES } from '@/lib/constants'
import { Search, Plus, Filter } from 'lucide-react'
import { useState } from 'react'

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  
  // TODO: Replace with actual courses from TanStack Query
  const courses: any[] = []
  const userRole: string = 'student' // TODO: Get from useAuth

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cursos</h1>
          <p className="text-muted-foreground">
            {userRole === 'teacher'
              ? 'Gestiona tus cursos'
              : 'Explora y aprende de los mejores cursos'}
          </p>
        </div>
        {userRole === 'teacher' && (
          <Button asChild>
            <Link href={APP_ROUTES.CREATE_COURSE}>
              <Plus className="mr-2 h-4 w-4" />
              Crear curso
            </Link>
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Courses Grid */}
      <div>
        {courses.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                {userRole === 'teacher'
                  ? 'No has creado cursos aún'
                  : 'No hay cursos disponibles'}
              </p>
              <p className="text-sm text-muted-foreground">
                {userRole === 'teacher'
                  ? 'Comienza creando tu primer curso'
                  : 'Vuelve más tarde para ver nuevos cursos'}
              </p>
              {userRole === 'teacher' && (
                <Button asChild className="mt-4">
                  <Link href={APP_ROUTES.CREATE_COURSE}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primer curso
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: any) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                image={course.image}
                instructor={course.instructor}
                students={course.students}
                rating={course.rating}
                level={course.level}
                href={`${APP_ROUTES.COURSES}/${course.id}`}
                action={userRole === 'teacher' ? 'manage' : 'view'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
