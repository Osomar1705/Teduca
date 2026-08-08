'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { APP_ROUTES } from '@/lib/constants'
import { getMentorInsights } from '@/lib/ai-mentor/insights'
import type {
  ActivitySignals,
  MentorInsights as Insights,
  RecommendationType,
} from '@/lib/ai-mentor/insights'
import type { StudentContext } from '@/lib/ai-mentor/types'

const TYPE_LABELS: Record<RecommendationType, string> = {
  mentoría: 'Mentoría',
  curso: 'Curso',
  comunidad: 'Comunidad',
  estudio: 'Estudio',
}

const TYPE_ROUTES: Record<RecommendationType, string> = {
  mentoría: APP_ROUTES.DISCOVER,
  curso: APP_ROUTES.COURSES,
  comunidad: APP_ROUTES.COMMUNITY,
  estudio: APP_ROUTES.MENTOR,
}

interface Props {
  context: StudentContext
  signals: ActivitySignals
}

export function MentorInsights({ context, signals }: Props) {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    getMentorInsights(context, signals)
      .then((result) => {
        if (!cancelled) setInsights(result)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
    // Se genera una vez por carga del dashboard: no debe re-pedirse en cada
    // render ni consumir cuota del modelo sin motivo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // El análisis es complementario: si el modelo no responde, el dashboard
  // sigue funcionando y esta tarjeta simplemente no aparece.
  if (failed) return null

  if (!insights) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Tu progreso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-3/4 rounded-full" />
          <Skeleton className="h-6 w-2/3 rounded-full" />
          <Skeleton className="h-16 rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  const { recommendation } = insights

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">Tu progreso</CardTitle>
          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="size-3" />
            Generado por tu mentor
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {insights.strengths.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Fortalezas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {insights.strengths.map((item) => (
                <Badge key={item} variant="success" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {insights.areas.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Áreas por mejorar
            </p>
            <div className="flex flex-wrap gap-1.5">
              {insights.areas.map((item) => (
                <Badge key={item} variant="warning" className="text-xs">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {insights.patterns.length > 0 && (
          <div className="space-y-1.5 border-t border-border/60 pt-3">
            {insights.patterns.map((pattern) => (
              <p key={pattern} className="text-xs leading-relaxed text-muted-foreground">
                · {pattern}
              </p>
            ))}
          </div>
        )}

        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">Recomendación del día</p>
            <Badge variant="info" className="shrink-0 text-xs">
              {TYPE_LABELS[recommendation.type]}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {recommendation.text}
          </p>
          <Button variant="outline" size="sm" className="mt-3" asChild>
            <Link href={TYPE_ROUTES[recommendation.type]}>
              Ir ahí
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
