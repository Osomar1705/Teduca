'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { CourseCard } from '@/components/edtech/CourseCard'
import { Stagger, StaggerItem } from '@/components/common/Motion'
import { getCourses } from '@/lib/edtech/service'
import { cn } from '@/lib/utils'
import type { Course } from '@/lib/edtech/types'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')

  useEffect(() => {
    getCourses().then(setCourses)
  }, [])

  const categories = useMemo(() => {
    const set = new Set(courses.map((c) => c.category))
    return ['Todos', ...[...set].sort()]
  }, [courses])

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = category === 'Todos' || c.category === category
      const matchQuery =
        !query ||
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.teacherName.toLowerCase().includes(query.toLowerCase())
      return matchCat && matchQuery
    })
  }, [courses, query, category])

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Cursos"
        description="Explorá y aprendé de los mejores cursos dictados por profesores verificados."
      />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cursos o profesores..."
          className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
      </div>

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

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
          No se encontraron cursos con esos filtros.
        </div>
      ) : (
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <StaggerItem key={c.id}>
              <CourseCard course={c} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
