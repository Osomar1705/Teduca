'use client'

import Link from 'next/link'
import { Star, MapPin, Heart, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HoverLift } from '@/components/common/Motion'
import { formatPrice, MODALITY_LABEL } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { TeacherProfile } from '@/lib/edtech/types'

export function TeacherCard({
  teacher,
  isFavorite,
  onToggleFavorite,
}: {
  teacher: TeacherProfile
  isFavorite?: boolean
  onToggleFavorite?: (id: string) => void
}) {
  return (
    <HoverLift>
      <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg">
        <div className="relative">
          <div className="bg-gradient-brand h-24" />
          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(teacher.id)}
              aria-label="Favorito"
              className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
            >
              <Heart
                className={cn(
                  'size-4 transition-colors',
                  isFavorite && 'fill-destructive text-destructive'
                )}
              />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={teacher.avatar}
            alt={teacher.name}
            className="absolute -bottom-8 left-5 size-16 rounded-2xl border-4 border-card object-cover shadow-md"
          />
        </div>

        <div className="flex flex-1 flex-col p-5 pt-10">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-foreground">
                {teacher.name}
              </h3>
              <p className="truncate text-sm text-muted-foreground">
                {teacher.specialty}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-sm">
              <Star className="size-4 fill-warning text-warning" />
              <span className="font-semibold">{teacher.rating}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="info">{MODALITY_LABEL[teacher.modality]}</Badge>
            {teacher.categories.slice(0, 1).map((c) => (
              <Badge key={c} variant="secondary">
                {c}
              </Badge>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {teacher.studentsCount.toLocaleString('es-AR')} alumnos
            </span>
            {teacher.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {teacher.location}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
            <div>
              <p className="text-lg font-bold text-foreground">
                {formatPrice(teacher.hourlyPrice, teacher.currency)}
              </p>
              <p className="text-xs text-muted-foreground">por hora</p>
            </div>
            <Button size="sm" variant="brand" asChild>
              <Link href={`/discover/${teacher.id}`}>Ver perfil</Link>
            </Button>
          </div>
        </div>
      </div>
    </HoverLift>
  )
}
