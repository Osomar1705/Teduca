'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, BookOpen, ArrowRight } from 'lucide-react'
import { CourseCard } from '@/components/edtech/CourseCard'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Stagger, StaggerItem } from '@/components/common/Motion'
import { getCourses, getReservations } from '@/lib/edtech/service'
import { getOnboarding } from '@/lib/onboarding/service'
import { APP_ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Course, Reservation } from '@/lib/edtech/types'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [c, r] = await Promise.all([getCourses(), getReservations().catch(() => [])])
      setCourses(c)
      setReservations(r)
      getOnboarding()
        .then((o) => setInterests(o.subject_tags ?? []))
        .catch(() => {})
      setLoading(false)
    }
    load()
  }, [])

  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category))
    return ['Todos', ...[...set].sort()]
  }, [courses])

  const searched = useMemo(() => {
    if (!query) return courses
    const q = query.toLowerCase()
    return courses.filter(
      (c) => c.title.toLowerCase().includes(q) || c.teacherName.toLowerCase().includes(q)
    )
  }, [courses, query])

  const activeCourses = useMemo(() => {
    const ids = new Set(reservations.filter((r) => r.courseId).map((r) => r.courseId))
    return courses.filter((c) => ids.has(c.id))
  }, [courses, reservations])

  const recommended = useMemo(() => {
    if (interests.length === 0) return []
    const lower = interests.map((i) => i.toLowerCase())
    return courses.filter((c) =>
      lower.some(
        (i) => c.category.toLowerCase().includes(i) || c.title.toLowerCase().includes(i)
      )
    )
  }, [courses, interests])

  const popular = useMemo(() => [...courses].sort((a, b) => b.rating - a.rating), [courses])

  const byCategory = useMemo(
    () => (category === 'Todos' ? searched : searched.filter((c) => c.category === category)),
    [searched, category]
  )

  const searchBox = (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar cursos..."
        className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
      />
    </div>
  )

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Cursos</h1>
          <p className="text-sm text-muted-foreground">Centro académico de TEDUCA</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cursos</h1>
          <p className="text-sm text-muted-foreground">Centro académico de TEDUCA</p>
        </div>
        <div className="sm:ml-auto">{searchBox}</div>
      </div>

      {activeCourses.length > 0 && (
        <CourseSection
          title="Continuar aprendiendo"
          description="Retomá donde lo dejaste"
          courses={activeCourses}
        />
      )}

      {recommended.length > 0 && (
        <CourseSection
          title="Recomendados"
          description="Según tus intereses"
          courses={recommended.slice(0, 6)}
        />
      )}

      <CourseSection
        title="Populares"
        description="Los mejor valorados"
        courses={popular.slice(0, 6)}
      />

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Por categoría</h2>
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                category === c
                  ? 'border-transparent bg-primary text-primary-foreground shadow-xs'
                  : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted hover:text-foreground'
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {byCategory.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No se encontraron cursos"
            description="Probá con otra búsqueda o categoría."
          />
        ) : (
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byCategory.map((c) => (
              <StaggerItem key={c.id}>
                <CourseCard course={c} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </div>
  )
}

function CourseSection({
  title,
  description,
  courses,
}: {
  title: string
  description?: string
  courses: Course[]
}) {
  if (courses.length === 0) return null
  return (
    <section className="mb-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <Link
          href={APP_ROUTES.COURSES}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Ver más <ArrowRight className="size-3" />
        </Link>
      </div>
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <StaggerItem key={c.id}>
            <CourseCard course={c} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
