import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, Users, Star } from 'lucide-react'

const levelVariant = {
  beginner: 'success',
  intermediate: 'info',
  advanced: 'warning',
} as const

const levelLabel = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
} as const

interface CourseCardProps {
  id: string
  title: string
  description?: string
  image?: string
  instructor: string
  students?: number
  rating?: number
  level?: 'beginner' | 'intermediate' | 'advanced'
  href: string
  action?: 'view' | 'enroll' | 'manage'
}

export function CourseCard({
  id,
  title,
  description,
  image,
  instructor,
  students = 0,
  rating,
  level = 'beginner',
  href,
  action = 'view',
}: CourseCardProps) {
  return (
    <Card className="group overflow-hidden hover:-translate-y-1 hover:shadow-lg">
      {/* Image */}
      {image ? (
        <div className="h-40 overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="bg-gradient-brand relative h-40 overflow-hidden">
          <div className="bg-grid-light absolute inset-0" />
          <BookOpen className="absolute right-4 bottom-4 size-12 text-white/30" />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg text-foreground line-clamp-2">
            {title}
          </h3>
          {rating && (
            <div className="flex items-center gap-1 whitespace-nowrap">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {description}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{students} estudiantes</span>
          </div>
          <Badge variant={levelVariant[level]}>{levelLabel[level]}</Badge>
        </div>

        <p className="text-sm font-medium text-muted-foreground mb-4">
          por {instructor}
        </p>

        {/* Button */}
        <Button asChild className="w-full">
          <Link href={href}>
            {action === 'view' && 'Ver curso'}
            {action === 'enroll' && 'Inscribirse'}
            {action === 'manage' && 'Gestionar'}
          </Link>
        </Button>
      </div>
    </Card>
  )
}
