'use client'

import Link from 'next/link'
import { Star, Clock, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { HoverLift } from '@/components/common/Motion'
import { formatPrice } from '@/lib/format'
import type { Course, CourseLevel } from '@/lib/edtech/types'

const LEVEL: Record<CourseLevel, { label: string; variant: 'success' | 'info' | 'warning' }> = {
  beginner: { label: 'Principiante', variant: 'success' },
  intermediate: { label: 'Intermedio', variant: 'info' },
  advanced: { label: 'Avanzado', variant: 'warning' },
}

export function CourseCard({ course }: { course: Course }) {
  const level = LEVEL[course.level]
  return (
    <HoverLift>
      <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg">
        <div className="relative h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.image}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Scrim para legibilidad del badge sobre imágenes variadas */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />
          <span className="absolute left-3 top-3">
            <Badge className="border-0 bg-white/90 text-slate-900 shadow-sm backdrop-blur">
              {course.category}
            </Badge>
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant={level.variant}>{level.label}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              {course.durationHours} h
            </span>
          </div>

          <h3 className="line-clamp-2 font-semibold text-foreground">
            {course.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3.5" />
              {course.teacherName}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-warning text-warning" />
              <span className="font-semibold text-foreground">{course.rating}</span>
              <span>({course.reviewsCount})</span>
            </span>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
            <div>
              <p className="text-lg font-bold text-foreground">
                {formatPrice(course.price, course.currency)}
              </p>
              <p className="text-xs text-muted-foreground">curso completo</p>
            </div>
            <Button size="sm" variant="brand" asChild>
              <Link href={`/discover/${course.teacherId}`}>Reservar</Link>
            </Button>
          </div>
        </div>
      </div>
    </HoverLift>
  )
}
