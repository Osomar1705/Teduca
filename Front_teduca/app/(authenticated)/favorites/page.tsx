'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Compass, Zap } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { TeacherCard } from '@/components/edtech/TeacherCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Stagger, StaggerItem } from '@/components/common/Motion'
import { getFavorites, toggleFavorite } from '@/lib/edtech/service'
import { APP_ROUTES } from '@/lib/constants'
import type { TeacherProfile } from '@/lib/edtech/types'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<Set<string>>(new Set())

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(id: string) {
    setRemoving((prev) => new Set(prev).add(id))
    await toggleFavorite(id)
    setFavorites((prev) => prev.filter((t) => t.id !== id))
    setRemoving((prev) => { const s = new Set(prev); s.delete(id); return s })
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Favoritos"
        description="Los profesores que guardaste. Reservá una clase cuando quieras."
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-20 text-center">
          <div className="mb-4 inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Heart className="size-7 text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground">Todavía no tenés favoritos</p>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Descubrí profesores en el modo Swipe y guardá los que más te gusten para reservar después.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="brand" asChild>
              <Link href={APP_ROUTES.DISCOVER}><Compass className="size-4" />Descubrir</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/discover/swipe"><Zap className="size-4" />Modo Swipe</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-5 text-sm text-muted-foreground">{favorites.length} profesor{favorites.length !== 1 ? 'es' : ''} guardado{favorites.length !== 1 ? 's' : ''}</p>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((t) => (
              <StaggerItem key={t.id}>
                <div className={removing.has(t.id) ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                  <TeacherCard
                    teacher={t}
                    isFavorite
                    onToggleFavorite={handleToggle}
                  />
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </>
      )}
    </div>
  )
}
