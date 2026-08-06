'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Star,
  MapPin,
  Users,
  GraduationCap,
  Clock,
  Languages,
  Video,
  Heart,
  ArrowLeft,
  CalendarPlus,
  MessageCircle,
  Globe,
  Link2,
  Check,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CourseCard } from '@/components/edtech/CourseCard'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import {
  getTeacher,
  getCoursesByTeacher,
  isFavorite,
  toggleFavorite,
  createReservation,
} from '@/lib/edtech/service'
import { formatPrice, MODALITY_LABEL } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Course, SocialLink, TeacherProfile } from '@/lib/edtech/types'

const SOCIAL_ICON = {
  website: Globe,
  linkedin: Link2,
  twitter: Link2,
  instagram: Link2,
  youtube: Link2,
} as const

export default function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [fav, setFav] = useState(false)
  const [reserving, setReserving] = useState(false)
  const [reserved, setReserved] = useState(false)

  useEffect(() => {
    getTeacher(id).then(setTeacher)
    getCoursesByTeacher(id).then(setCourses)
    isFavorite(id).then(setFav)
  }, [id])

  async function handleFav() {
    setFav(await toggleFavorite(id))
  }

  async function handleReserve() {
    if (!teacher) return
    setReserving(true)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 5)
    await createReservation({
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherAvatar: teacher.avatar,
      courseId: courses[0]?.id,
      courseTitle: courses[0]?.title,
      date: nextWeek.toISOString().slice(0, 10),
      time: '18:00',
      modality: teacher.modality === 'both' ? 'virtual' : teacher.modality,
      price: teacher.hourlyPrice,
      currency: teacher.currency,
    })
    setReserving(false)
    setReserved(true)
    setTimeout(() => router.push('/reservations'), 900)
  }

  if (!teacher) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/discover">
          <ArrowLeft className="size-4" />
          Volver a descubrir
        </Link>
      </Button>

      {/* Cabecera */}
      <FadeIn>
        <Card className="overflow-hidden p-0">
          <div className="bg-gradient-brand relative h-32">
            <div className="bg-grid-light absolute inset-0" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className="-mt-12 size-24 rounded-2xl border-4 border-card object-cover shadow-md"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {teacher.name}
                </h1>
                <p className="text-muted-foreground">{teacher.specialty}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-4 fill-warning text-warning" />
                    <span className="font-semibold text-foreground">
                      {teacher.rating}
                    </span>
                    ({teacher.reviewsCount} reseñas)
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-4" />
                    {teacher.studentsCount.toLocaleString('es-AR')} alumnos
                  </span>
                  {teacher.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-4" />
                      {teacher.location}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleFav}
                aria-label="Favorito"
              >
                <Heart
                  className={cn(
                    'size-5',
                    fav && 'fill-destructive text-destructive'
                  )}
                />
              </Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-2 font-semibold text-foreground">Sobre mí</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {teacher.bio}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <InfoRow icon={GraduationCap} label="Universidad" value={teacher.university} />
              <InfoRow icon={Clock} label="Experiencia" value={`${teacher.experienceYears} años`} />
              <InfoRow icon={Video} label="Modalidad" value={MODALITY_LABEL[teacher.modality]} />
              <InfoRow icon={Languages} label="Idiomas" value={teacher.languages.join(', ')} />
            </div>
          </Card>

          {/* Horarios */}
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-foreground">
              Horarios disponibles
            </h2>
            <div className="flex flex-col gap-3">
              {teacher.availability.map((a) => (
                <div key={a.day} className="flex items-center gap-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                    {a.day}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {a.slots.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Cursos */}
          {courses.length > 0 && (
            <div>
              <h2 className="mb-4 font-semibold text-foreground">
                Cursos que enseña
              </h2>
              <Stagger className="grid gap-6 sm:grid-cols-2">
                {courses.map((c) => (
                  <StaggerItem key={c.id}>
                    <CourseCard course={c} />
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          )}
        </div>

        {/* Sidebar de reserva */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                {formatPrice(teacher.hourlyPrice, teacher.currency)}
              </span>
              <span className="text-sm text-muted-foreground">/ hora</span>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Button
                variant={reserved ? 'success' : 'brand'}
                onClick={handleReserve}
                disabled={reserving || reserved}
              >
                {reserved ? (
                  <>
                    <Check className="size-4" />
                    ¡Reservada!
                  </>
                ) : (
                  <>
                    <CalendarPlus className="size-4" />
                    {reserving ? 'Reservando...' : 'Solicitar una clase'}
                  </>
                )}
              </Button>
              <Button variant="outline">
                <MessageCircle className="size-4" />
                Contactar
              </Button>
            </div>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {teacher.categories.map((c) => (
                <Badge key={c} variant="default">
                  {c}
                </Badge>
              ))}
            </div>

            {teacher.socials && teacher.socials.length > 0 && (
              <div className="mt-5 border-t border-border pt-5">
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                  Redes
                </p>
                <div className="flex gap-2">
                  {teacher.socials.map((s: SocialLink) => {
                    const Icon = SOCIAL_ICON[s.type] ?? Globe
                    return (
                      <a
                        key={s.type}
                        href={s.url?.startsWith('https://') ? s.url : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Icon className="size-4" />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
