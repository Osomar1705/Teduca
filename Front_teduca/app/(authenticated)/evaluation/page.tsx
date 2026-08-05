'use client'

import Link from 'next/link'
import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, MessageCircle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react'
import { APP_ROUTES, API_ENDPOINTS } from '@/lib/constants'
import { FadeIn } from '@/components/common/Motion'
import { apiClient } from '@/lib/api-client'

const CONTACT_EMAIL   = 'teduca25@gmail.com'
const CONTACT_WHATSAPP = '+51934317464'
const WHATSAPP_MSG    = encodeURIComponent('Hola TEDUCA, me interesa aplicar para ser Profesor. Quisiera saber más sobre el proceso de evaluación.')

const WHAT_WE_VALUE = [
  'Dominio sólido de tu área de especialidad',
  'Capacidad para explicar conceptos complejos con claridad',
  'Experiencia enseñando (formal o informal)',
  'Compromiso con los estudiantes',
  'Buena comunicación y puntualidad',
]

export default function EvaluationPage() {
  const requestTeacherRole = useCallback(() => {
    apiClient.post(API_ENDPOINTS.USER.REQUEST_TEACHER).catch(() => {})
  }, [])

  return (
    <div className="mx-auto max-w-xl">
      <FadeIn>
        {/* Back */}
        <Link
          href={APP_ROUTES.BECOME_TEACHER}
          className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver
        </Link>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Solicitar evaluación</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            El proceso es rápido. Contáctanos y coordinamos una entrevista breve.
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Proceso de evaluación
          </h2>
          <div className="space-y-4">
            {[
              { icon: MessageCircle, label: 'Contacto inicial',  desc: 'Escríbenos. Te respondemos en menos de 24h.',          time: '~24h' },
              { icon: Clock,         label: 'Entrevista breve',  desc: 'Conversación de 20-30 min para conocerte mejor.',       time: '30 min' },
              { icon: CheckCircle2,  label: 'Resultado',         desc: 'Te notificamos si fuiste aprobado y activamos tu cuenta.', time: '~48h' },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="size-3.5 text-primary" />
                  </div>
                  {i < arr.length - 1 && <div className="w-px flex-1 min-h-4 bg-border/60" />}
                </div>
                <div className="pb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{step.label}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{step.time}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Qué valoramos */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qué valoramos</h2>
          <ul className="space-y-2">
            {WHAT_WE_VALUE.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div className="space-y-3">
          <p className="text-center text-xs text-muted-foreground">Elige tu canal preferido para iniciar el proceso:</p>

          {/* WhatsApp */}
          <motion.a
            href={`https://wa.me/${CONTACT_WHATSAPP}?text=${WHATSAPP_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={requestTeacherRole}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-colors hover:bg-emerald-500/10"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500">
              <MessageCircle className="size-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Escribir por WhatsApp</p>
              <p className="text-xs text-muted-foreground">+51 934 317 464 · Respuesta rápida</p>
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Abrir →</span>
          </motion.a>

          {/* Email */}
          <motion.a
            href={`mailto:${CONTACT_EMAIL}?subject=Solicitud de evaluación TEDUCA Profesor&body=Hola equipo TEDUCA,%0A%0AMe gustaría aplicar para ser Profesor en TEDUCA.%0A%0AMi área de especialidad es: [escribe aquí]%0A%0AQuedo atento a sus instrucciones.`}
            onClick={requestTeacherRole}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Enviar correo</p>
              <p className="text-xs text-muted-foreground">{CONTACT_EMAIL}</p>
            </div>
            <span className="text-xs text-muted-foreground">Abrir →</span>
          </motion.a>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          El equipo TEDUCA revisará tu solicitud y te contactará para coordinar los próximos pasos.
          Tu cuenta seguirá siendo de Alumno hasta ser aprobado.
        </p>
      </FadeIn>
    </div>
  )
}
