import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { MentorRecommendation } from '@/lib/ai-mentor/types'

const TYPE_LABELS: Record<MentorRecommendation['type'], string> = {
  mentoría:   'Mentoría',
  curso:      'Curso',
  comunidad:  'Comunidad',
  estudio:    'Estudio',
}

interface Props {
  recommendation: MentorRecommendation
}

export function DailyRecommendation({ recommendation }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">Recomendación del día</CardTitle>
          <Badge variant="info" className="shrink-0 text-xs">
            {TYPE_LABELS[recommendation.type]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed text-muted-foreground">{recommendation.text}</p>
        {recommendation.ctaLabel && recommendation.ctaHref && (
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href={recommendation.ctaHref}>
              {recommendation.ctaLabel}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
