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
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
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
      <PageHeader
        title="Mi Participación"
        description="Tu impacto en la comunidad académica: ranking, asistencia, ayudas y más."
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !stats ? (
        <div className="space-y-6">
          <EmptyState
            icon={Sparkles}
            title="Todavía no hay actividad registrada"
            description="Esta sección se activará cuando tengas actividad registrada. Participá en cursos, mentorías y ayudá a tus compañeros para empezar a sumar."
          />
          <Stagger className="grid gap-4 opacity-60 sm:grid-cols-2 lg:grid-cols-3">
            {METRICS.map(({ key, label, icon: Icon }) => (
              <StaggerItem key={key}>
                <Card className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <Skeleton className="mt-1.5 h-5 w-16" />
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map(({ key, label, icon: Icon }) => (
            <StaggerItem key={key}>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-lg font-bold text-foreground">{renderValue(key)}</p>
                  </div>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  )
}
