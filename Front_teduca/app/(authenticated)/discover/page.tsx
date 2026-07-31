'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { TeacherCard } from '@/components/edtech/TeacherCard'
import { Button } from '@/components/ui/button'
import { Stagger, StaggerItem, FadeIn } from '@/components/common/Motion'
import { getTeachers, getFavorites, toggleFavorite } from '@/lib/edtech/service'
import { cn } from '@/lib/utils'
import type { TeacherProfile } from '@/lib/edtech/types'

export default function DiscoverPage() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [category, setCategory] = useState<string>('Todos')

  useEffect(() => {
    getTeachers().then(setTeachers)
    getFavorites().then((f) => setFavorites(new Set(f.map((t) => t.id))))
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>()
    teachers.forEach((t) => t.categories.forEach((c) => set.add(c)))
    return ['Todos', ...[...set].sort()]
  }, [teachers])

  const filtered = useMemo(
    () =>
      category === 'Todos'
        ? teachers
        : teachers.filter((t) => t.categories.includes(category)),
    [teachers, category]
  )

  async function handleToggle(id: string) {
    const now = await toggleFavorite(id)
    setFavorites((prev) => {
      const next = new Set(prev)
      if (now) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Descubrir profesores"
        description="Explorá docentes verificados y encontrá tu match ideal."
        actions={
          <Button variant="brand" asChild>
            <Link href="/discover/swipe">
              <Sparkles className="size-4" />
              Modo swipe
            </Link>
          </Button>
        }
      />

      <FadeIn>
        <Link
          href="/discover/swipe"
          className="mb-8 flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-subtle p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gradient-brand inline-flex size-11 items-center justify-center rounded-xl text-white">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Probá el modo swipe</p>
              <p className="text-sm text-muted-foreground">
                Deslizá para encontrar profesores como en una app de citas, pero para aprender.
              </p>
            </div>
          </div>
          <ArrowRight className="hidden size-5 shrink-0 text-muted-foreground sm:block" />
        </Link>
      </FadeIn>

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

      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <StaggerItem key={t.id}>
            <TeacherCard
              teacher={t}
              isFavorite={favorites.has(t.id)}
              onToggleFavorite={handleToggle}
            />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}
