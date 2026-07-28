'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { BookOpen, Users, Star, ArrowLeft, Plus } from 'lucide-react'
import { useState } from 'react'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [isEnrolling, setIsEnrolling] = useState(false)
  
  // TODO: Fetch actual course data from TanStack Query
  // const { data: course, isLoading } = useCourse(courseId)
  const course: any = null
  const userRole: string = 'student' // TODO: Get from useAuth

  const handleEnroll = async () => {
    try {
      setIsEnrolling(true)
      // TODO: Implement enrollment API call
      console.log('[v0] Enrolling in course:', courseId)
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Button>

      {course ? (
        <>
          {/* Hero Section */}
          <div className="rounded-lg bg-muted h-96 flex items-center justify-center">
            <BookOpen className="h-20 w-20 text-muted-foreground" />
          </div>

          {/* Course Info */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground mb-2">
                      {course.title}
                    </h1>
                    <p className="text-muted-foreground">
                      por {course.instructor}
                    </p>
                  </div>
                  {course.rating && (
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold">{course.rating}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>{course.level}</Badge>
                  <Badge variant="outline">{course.category}</Badge>
                </div>
              </div>

              {/* Description */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Descripción
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {course.description}
                </p>
              </Card>

              {/* Lessons */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Lecciones
                </h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border border-border hover:bg-muted/50 transition cursor-pointer">
                    <p className="font-medium">Lección 1: Introducción</p>
                    <p className="text-sm text-muted-foreground">
                      Aprende los conceptos básicos
                    </p>
                  </div>
                  {/* More lessons will render here */}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <Card className="p-6 h-fit sticky top-6">
              <div className="space-y-6">
                {/* Stats */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{course.students || 0} estudiantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>5 lecciones</span>
                  </div>
                </div>

                {/* Action Button */}
                {userRole === 'student' ? (
                  <Button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full"
                  >
                    {isEnrolling ? 'Inscribiendo...' : 'Inscribirse'}
                  </Button>
                ) : (
                  <Button asChild className="w-full">
                    <Link href={`/courses/${courseId}/edit`}>
                      Editar curso
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Cargando curso...</p>
        </Card>
      )}
    </div>
  )
}
