import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, Users, Star } from 'lucide-react'

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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {image && (
        <div className="h-40 bg-muted overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
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
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span className="capitalize">{level}</span>
          </div>
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
