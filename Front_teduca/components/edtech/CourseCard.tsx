'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
      <Link
        href={`/discover/${course.teacherId}`}
        className="group flex h-full gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-md"
      >
        <div className="size-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={course.image}
            alt={course.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {course.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{course.teacherName}</p>
          <div className="mt-auto flex items-center gap-2 pt-2">
            <Badge variant={level.variant} className="text-[10px]">
              {course.category}
            </Badge>
            <span className="text-xs text-muted-foreground">{course.durationHours}h</span>
            <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-warning text-warning" />
              {course.rating}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-foreground">
            {formatPrice(course.price, course.currency)}
          </p>
        </div>
      </Link>
    </HoverLift>
  )
}
