'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  GraduationCap, Users, FlaskConical, Boxes, Code2,
  Award, MessagesSquare, CalendarDays, Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { TeacherCard } from '@/components/edtech/TeacherCard'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Stagger, StaggerItem, FadeIn } from '@/components/common/Motion'
import { getTeachers, getFavorites, toggleFavorite } from '@/lib/edtech/service'
import { cn } from '@/lib/utils'
import type { TeacherProfile } from '@/lib/edtech/types'

type Tab = 'swipe' | 'teachers' | 'match'

const MATCH_CATEGORIES: {
  title: string
  description: string
  icon: LucideIcon
  soon?: boolean
}[] = [
  { title: 'Mentores',              description: 'Conectá con profesores y guías académicos.',       icon: GraduationCap },
  { title: 'Compañeros de estudio', description: 'Encontrá gente con tus mismos objetivos.',         icon: Users,         soon: true },
  { title: 'Investigadores',        description: 'Sumate a líneas de investigación activas.',         icon: FlaskConical,  soon: true },
  { title: 'Equipos y proyectos',   description: 'Armá o unite a equipos para construir.',           icon: Boxes,         soon: true },
  { title: 'Hackathons',            description: 'Competí y aprendé en desafíos intensivos.',         icon: Code2,         soon: true },
  { title: 'Clubes académicos',     description: 'Comunidades por área de interés.',                 icon: Award,         soon: true },
  { title: 'Comunidades',           description: 'Espacios de aprendizaje colaborativo.',            icon: MessagesSquare, soon: true },
  { title: 'Eventos',               description: 'Charlas, talleres y encuentros.',                  icon: CalendarDays,  soon: true },
]

const TABS: { key: Tab; label: string; href?: string }[] = [
  { key: 'swipe',    label: 'Modo Swipe',     href: '/discover/swipe' },
  { key: 'teachers', label: 'Profesores' },
  { key: 'match',    label: 'Match Académico' },
]

export default function DiscoverPage() {
  const [teachers, setTeachers]   = useState<TeacherProfile[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [category, setCategory]   = useState<string>('Todos')
  const [tab, setTab]             = useState<Tab>('teachers')
  const [loading, setLoading]     = useState(true)

  // For animated tab indicator
  const tabRefs = useRef<Record<string, HTMLButtonElement | HTMLAnchorElement | null>>({})

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
    () => category === 'Todos' ? teachers : teachers.filter((t) => t.categories.includes(category)),
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
      {/* Header */}
      <FadeIn>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Descubrir</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Conecta con profesores, encuentra el mentor ideal y descubre oportunidades para crecer académica y profesionalmente.
          </p>
        </div>
      </FadeIn>

      {/* Tabs — premium underline con indicador animado */}
      <FadeIn>
        <div className="relative mb-7">
          <div className="flex gap-1 border-b border-border/60">
            {TABS.map((t) => {
              const active = tab === t.key
              if (t.href) {
                return (
                  <Link
                    key={t.key}
                    href={t.href}
                    ref={(el) => { tabRefs.current[t.key] = el }}
                    className={cn(
                      'relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                      'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Sparkles className="size-3.5 text-primary" />
                    {t.label}
                    <span className="ml-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      Nuevo
                    </span>
                  </Link>
                )
              }
              return (
                <button
                  key={t.key}
                  ref={(el) => { tabRefs.current[t.key] = el }}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'relative px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t.label}
                  {active && (
                    <motion.span
                      layoutId="discover-tab-indicator"
                      className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </FadeIn>

      {/* Tab: Profesores */}
      {tab === 'teachers' && (
        <>
          <FadeIn>
            <div className="mb-5 flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150',
                    category === c
                      ? 'border-transparent bg-primary text-primary-foreground shadow-xs'
                      : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </FadeIn>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : (
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => (
                <StaggerItem key={t.id}>
                  <TeacherCard teacher={t} isFavorite={favorites.has(t.id)} onToggleFavorite={handleToggle} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </>
      )}

      {/* Tab: Match Académico */}
      {tab === 'match' && (
        <FadeIn>
          <div className="divide-y divide-border">
            {MATCH_CATEGORIES.map((c) => {
              const Icon = c.icon
              return (
                <div
                  key={c.title}
                  className="group flex items-center gap-4 py-4 transition-colors hover:bg-muted/30 rounded-xl px-2 -mx-2"
                >
                  <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
                    <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <Badge variant={c.soon ? 'secondary' : 'default'} className="flex-shrink-0 text-xs">
                    {c.soon ? 'Próximamente' : 'Disponible'}
                  </Badge>
                </div>
              )
            })}
          </div>
        </FadeIn>
      )}
    </div>
  )
}
