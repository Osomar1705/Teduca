'use client'

import Link from 'next/link'
import { Star, Heart } from 'lucide-react'
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
      <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md">
        <div className="flex items-start gap-3 p-4 pb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={teacher.avatar}
            alt={teacher.name}
            className="size-12 flex-shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground">{teacher.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{teacher.specialty}</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs">
                <Star className="size-3 fill-warning text-warning" />
                {teacher.rating}
              </span>
              <span className="text-xs text-muted-foreground">
                {teacher.studentsCount.toLocaleString('es-AR')} alumnos
              </span>
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
            <p className="text-sm font-bold text-foreground">
              {formatPrice(teacher.hourlyPrice, teacher.currency)}
              <span className="text-xs font-normal text-muted-foreground">/h</span>
            </p>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(teacher.id)}
                aria-label="Favorito"
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Heart
                  className={cn(
                    'size-4',
                    isFavorite && 'fill-destructive text-destructive'
                  )}
                />
              </button>
            )}
          </div>
        </div>

        <div className="mx-4 border-t border-border" />

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="info" className="px-1.5 py-0.5 text-[10px]">
              {MODALITY_LABEL[teacher.modality]}
            </Badge>
            {teacher.categories.slice(0, 1).map((c) => (
              <Badge key={c} variant="secondary" className="px-1.5 py-0.5 text-[10px]">
                {c}
              </Badge>
            ))}
          </div>
          <Button size="sm" variant="ghost" asChild className="h-7 text-xs">
            <Link href={`/discover/${teacher.id}`}>Ver perfil</Link>
          </Button>
        </div>
      </div>
    </HoverLift>
  )
}
