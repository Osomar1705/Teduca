'use client'

import { useEffect, useState } from 'react'
import {
  Trophy,
  CalendarCheck,
  ListChecks,
  HandHelping,
  MessageSquareCheck,
  GraduationCap,
  Clock,
  BarChart3,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Stagger, StaggerItem } from '@/components/common/Motion'
import { getParticipationStats } from '@/lib/participation/service'
import type { ParticipationStats } from '@/lib/participation/types'

const METRICS: { key: keyof ParticipationStats | 'ranking'; label: string; icon: typeof Trophy }[] = [
  { key: 'ranking', label: 'Ranking en cursos', icon: Trophy },
  { key: 'weeklyScore', label: 'Participación semanal', icon: BarChart3 },
  { key: 'monthlyScore', label: 'Participación mensual', icon: BarChart3 },
  { key: 'attendanceRate', label: 'Asistencia', icon: CalendarCheck },
  { key: 'activitiesCompleted', label: 'Actividades completadas', icon: ListChecks },
  { key: 'helpGiven', label: 'Ayudas a estudiantes', icon: HandHelping },
  { key: 'acceptedAnswers', label: 'Respuestas aceptadas', icon: MessageSquareCheck },
  { key: 'mentorshipsAttended', label: 'Mentorías asistidas', icon: GraduationCap },
  { key: 'studyTimeHours', label: 'Tiempo de estudio', icon: Clock },
]

export default function ParticipatePage() {
  const [stats, setStats] = useState<ParticipationStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getParticipationStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  function renderValue(key: string): string {
    if (!stats) return '—'
    if (key === 'ranking') {
      return stats.ranking ? `#${stats.ranking.position}/${stats.ranking.total}` : '—'
    }
    const v = stats[key as keyof ParticipationStats]
    if (key === 'attendanceRate') return `${v}%`
    if (key === 'studyTimeHours') return `${v} h`
    return String(v)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Participación Académica
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Tu impacto en la comunidad TEDUCA</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(METRICS.length)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : !stats ? (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {METRICS.map(({ key, label, icon: Icon }) => (
              <div key={key} className="rounded-xl border border-border p-4 opacity-50">
                <Icon className="mb-2 size-4 text-muted-foreground" />
                <p className="text-2xl font-bold text-foreground">—</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
            <BarChart3 className="mx-auto mb-3 size-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">Datos en camino</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Tu participación se registrará automáticamente a medida que uses la plataforma.
              Asistí a mentorías, completá cursos y ayudá a otros estudiantes.
            </p>
          </div>
        </>
      ) : (
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {METRICS.map(({ key, label, icon: Icon }) => (
            <StaggerItem key={key}>
              <div className="rounded-xl border border-border p-4">
                <Icon className="mb-2 size-4 text-primary" />
                <p className="text-2xl font-bold text-foreground">{renderValue(key)}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
