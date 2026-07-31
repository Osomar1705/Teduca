'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Compass } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { TeacherCard } from '@/components/edtech/TeacherCard'
import { Button } from '@/components/ui/button'
import { Stagger, StaggerItem } from '@/components/common/Motion'
import { getFavorites, toggleFavorite } from '@/lib/edtech/service'
import { APP_ROUTES } from '@/lib/constants'
import type { TeacherProfile } from '@/lib/edtech/types'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFavorites().then((f) => {
      setFavorites(f)
      setLoading(false)
    })
  }, [])

  async function handleToggle(id: string) {
    await toggleFavorite(id)
    setFavorites((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Favoritos"
        description="Los profesores que guardaste. Reservá una clase cuando quieras."
      />

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Heart className="size-6" />
          </div>
          <p className="mt-4 font-semibold text-foreground">
            Todavía no tenés favoritos
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Descubrí profesores y guardá los que más te gusten para reservar después.
          </p>
          <Button variant="brand" asChild className="mt-5">
            <Link href={APP_ROUTES.DISCOVER}>
              <Compass className="size-4" />
              Descubrir profesores
            </Link>
          </Button>
        </div>
      ) : (
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((t) => (
            <StaggerItem key={t.id}>
              <TeacherCard
                teacher={t}
                isFavorite
                onToggleFavorite={handleToggle}
              />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
