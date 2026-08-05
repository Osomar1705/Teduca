'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ShieldCheck, Clock, Users, Star, ChevronRight } from 'lucide-react'
import { APP_ROUTES } from '@/lib/constants'
import { FadeIn } from '@/components/common/Motion'

const BENEFITS = [
  { icon: Users, title: 'Alcanza a miles',      desc: 'Conecta con estudiantes universitarios de todo Perú.' },
  { icon: Star,  title: 'Construye reputación', desc: 'Sistema de calificaciones y reseñas que validan tu experiencia.' },
  { icon: Clock, title: 'Flexibilidad total',   desc: 'Tú defines horarios, precio por hora y modalidad.' },
]

const STEPS = [
  { n: 1, title: 'Contacta al equipo', desc: 'Escríbenos por correo o WhatsApp indicando tu área de especialidad.' },
  { n: 2, title: 'Evaluación',          desc: 'Coordinaremos una entrevista para conocer tu perfil y habilidades de enseñanza.' },
  { n: 3, title: 'Acceso aprobado',    desc: 'Si eres aprobado, activamos tu cuenta de Profesor con acceso completo.' },
]

export default function BecomeTeacherPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <FadeIn>
        {/* Back */}
        <Link
          href={APP_ROUTES.DASHBOARD}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver a TEDUCA Alumno
        </Link>

        {/* Hero */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
          {/* Banner degradado */}
          <div className="relative h-32 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative size-20 overflow-hidden rounded-2xl border-4 border-background shadow-xl">
                <Image src="/teduca-profesor.jpeg" alt="TEDUCA Profesor" fill className="object-cover" />
              </div>
            </div>
          </div>

          <div className="p-6 text-center">
            <div className="mb-1.5 flex items-center justify-center gap-2">
              <ShieldCheck className="size-5 text-amber-500" />
              <h1 className="text-xl font-bold text-foreground">Conviértete en Profesor TEDUCA</h1>
            </div>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
              Para mantener la calidad de nuestra comunidad, todos los profesores pasan por un
              proceso de evaluación. No solo verificamos conocimientos técnicos, sino también
              habilidades para enseñar y acompañar estudiantes.
            </p>
          </div>
        </div>

        {/* Beneficios */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-4 text-center"
            >
              <div className="mx-auto mb-2.5 flex size-9 items-center justify-center rounded-full bg-amber-500/10">
                <Icon className="size-4 text-amber-500" />
              </div>
              <p className="mb-1 text-xs font-semibold text-foreground">{title}</p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Proceso */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">¿Cómo funciona el proceso?</h2>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {s.n}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 bg-border/60" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={APP_ROUTES.EVALUATION}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Solicitar evaluación <ChevronRight className="size-4" />
          </Link>
          <Link
            href={APP_ROUTES.DASHBOARD}
            className="flex flex-1 items-center justify-center rounded-xl border border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Volver a TEDUCA Alumno
          </Link>
        </div>
      </FadeIn>
    </div>
  )
}
