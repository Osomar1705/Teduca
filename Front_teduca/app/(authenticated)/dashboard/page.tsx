'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Compass, BookOpen, Heart, CalendarCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { TeacherCard } from '@/components/edtech/TeacherCard'
import { CourseCard } from '@/components/edtech/CourseCard'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { APP_ROUTES } from '@/lib/constants'
import {
  getCourses,
  getCurrentUser,
  getFavorites,
  getReservations,
  getTeachers,
} from '@/lib/edtech/service'
import type { Course, TeacherProfile } from '@/lib/edtech/types'

export default function DashboardPage() {
  const [name, setName] = useState('')
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [favCount, setFavCount] = useState(0)
  const [resCount, setResCount] = useState(0)

  useEffect(() => {
    getCurrentUser().then((u) => setName(u.name.split(' ')[0]))
    getTeachers().then((t) => setTeachers(t.slice(0, 3)))
    getCourses().then((c) => setCourses(c.slice(0, 3)))
    getFavorites().then((f) => setFavCount(f.length))
    getReservations().then((r) =>
      setResCount(r.filter((x) => x.status !== 'cancelled').length)
    )
  }, [])

  return (
    <div className="mx-auto max-w-6xl">
      <FadeIn>
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-brand p-8 text-white shadow-lg">
          <div className="bg-grid absolute inset-0 opacity-20" />
          <div className="relative">
            <p className="text-sm font-medium text-white/80">
              Hola{name ? `, ${name}` : ''} 👋
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              Encontrá al profesor ideal para vos
            </h1>
            <p className="mt-2 max-w-lg text-white/80">
              Descubrí docentes verificados, reservá clases y aprendé a tu ritmo.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-5 bg-white text-primary hover:bg-white/90"
            >
              <Link href={APP_ROUTES.DISCOVER}>
                Descubrir profesores
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </FadeIn>

      <Stagger className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Profesores', value: teachers.length ? '8+' : '—', icon: Compass, href: APP_ROUTES.DISCOVER },
          { title: 'Cursos', value: courses.length ? '10+' : '—', icon: BookOpen, href: APP_ROUTES.COURSES },
          { title: 'Favoritos', value: favCount, icon: Heart, href: APP_ROUTES.FAVORITES },
          { title: 'Reservas activas', value: resCount, icon: CalendarCheck, href: APP_ROUTES.RESERVATIONS },
        ].map((s) => (
          <StaggerItem key={s.title}>
            <Link href={s.href} className="block">
              <StatsCard title={s.title} value={s.value} icon={s.icon} />
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <section className="mb-10">
        <SectionHeader
          title="Profesores recomendados"
          href={APP_ROUTES.DISCOVER}
        />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <StaggerItem key={t.id}>
              <TeacherCard teacher={t} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section>
        <SectionHeader title="Cursos populares" href={APP_ROUTES.COURSES} />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <StaggerItem key={c.id}>
              <CourseCard course={c} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Ver todos <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
