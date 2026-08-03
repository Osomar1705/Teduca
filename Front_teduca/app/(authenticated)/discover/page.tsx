'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  FlaskConical,
  Boxes,
  Code2,
  Award,
  MessagesSquare,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { TeacherCard } from '@/components/edtech/TeacherCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Stagger, StaggerItem, FadeIn } from '@/components/common/Motion'
import { getTeachers, getFavorites, toggleFavorite } from '@/lib/edtech/service'
import { cn } from '@/lib/utils'
import type { TeacherProfile } from '@/lib/edtech/types'

type Tab = 'teachers' | 'match' | 'swipe'

const MATCH_CATEGORIES: {
  title: string
  description: string
  icon: LucideIcon
  soon?: boolean
}[] = [
  { title: 'Mentores', description: 'Conectá con profesores y guías académicos.', icon: GraduationCap },
  { title: 'Compañeros de estudio', description: 'Encontrá gente con tus mismos objetivos.', icon: Users, soon: true },
  { title: 'Investigadores', description: 'Sumate a líneas de investigación activas.', icon: FlaskConical, soon: true },
  { title: 'Equipos y proyectos', description: 'Armá o unite a equipos para construir.', icon: Boxes, soon: true },
  { title: 'Hackathons', description: 'Competí y aprendé en desafíos intensivos.', icon: Code2, soon: true },
  { title: 'Clubes académicos', description: 'Comunidades por área de interés.', icon: Award, soon: true },
  { title: 'Comunidades', description: 'Espacios de aprendizaje colaborativo.', icon: MessagesSquare, soon: true },
  { title: 'Eventos', description: 'Charlas, talleres y encuentros.', icon: CalendarDays, soon: true },
]

export default function DiscoverPage() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [category, setCategory] = useState<string>('Todos')
  const [tab, setTab] = useState<Tab>('teachers')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getTeachers(), getFavorites().catch(() => [])])
      .then(([t, f]) => {
        setTeachers(t)
        setFavorites(new Set(f.map((x) => x.id)))
      })
      .finally(() => setLoading(false))
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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'teachers', label: 'Profesores' },
    { key: 'match', label: 'Match Académico' },
    { key: 'swipe', label: 'Swipe' },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Descubrir"
        description="Encontrá profesores, compañeros y comunidades para tu camino académico."
        actions={
          <Button variant="brand" asChild>
            <Link href="/discover/swipe">
              <Sparkles className="size-4" />
              Modo swipe
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => (t.key === 'swipe' ? undefined : setTab(t.key))}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t.key && t.key !== 'swipe'
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {t.key === 'swipe' ? (
              <Link href="/discover/swipe" className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> {t.label}
              </Link>
            ) : (
              t.label
            )}
          </button>
        ))}
      </div>

      {tab === 'teachers' && (
        <>
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

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : (
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
          )}
        </>
      )}

      {tab === 'match' && (
        <FadeIn>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MATCH_CATEGORIES.map((c) => {
              const Icon = c.icon
              return (
                <StaggerItem key={c.title}>
                  <Card className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between">
                      <div className="inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <Badge variant={c.soon ? 'secondary' : 'default'}>
                        {c.soon ? 'Próximamente' : 'Ver más'}
                      </Badge>
                    </div>
                    <h3 className="mt-3 font-semibold text-foreground">{c.title}</h3>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.description}</p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      {c.soon ? 'Estamos construyendo esta sección.' : 'Explorá conexiones disponibles.'}
                    </p>
                  </Card>
                </StaggerItem>
              )
            })}
          </Stagger>
        </FadeIn>
      )}

      {tab === 'swipe' && (
        <Link
          href="/discover/swipe"
          className="flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-subtle p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gradient-brand inline-flex size-11 items-center justify-center rounded-xl text-white">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Ir al modo swipe</p>
              <p className="text-sm text-muted-foreground">
                Deslizá para encontrar profesores, como en una app de citas pero para aprender.
              </p>
            </div>
          </div>
          <ArrowRight className="hidden size-5 shrink-0 text-muted-foreground sm:block" />
        </Link>
      )}
    </div>
  )
}
