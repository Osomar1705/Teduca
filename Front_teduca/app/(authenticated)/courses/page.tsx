'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { CourseCard } from '@/components/edtech/CourseCard'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { Stagger, StaggerItem } from '@/components/common/Motion'
import { getCourses, getReservations } from '@/lib/edtech/service'
import { getOnboarding } from '@/lib/onboarding/service'
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

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader title="Cursos" description="Tu centro académico." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Cursos"
        description="Tu centro académico: continuá donde lo dejaste y descubrí lo nuevo."
      />

      <div className="relative mb-8 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cursos o profesores..."
          className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
      </div>

      {activeCourses.length > 0 && (
        <CourseSection title="Continuar aprendiendo" courses={activeCourses} />
      )}

      {recommended.length > 0 && (
        <CourseSection title="Recomendados para vos" courses={recommended.slice(0, 6)} />
      )}

      <CourseSection title="Populares" courses={popular.slice(0, 6)} />

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">Por categoría</h2>
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                category === c
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
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
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

function CourseSection({ title, courses }: { title: string; courses: Course[] }) {
  if (courses.length === 0) return null
  return (
    <section className="mb-10">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <StaggerItem key={c.id}>
            <CourseCard course={c} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
