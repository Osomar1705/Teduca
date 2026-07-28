import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface GradeCardProps {
  title: string
  score?: number
  maxScore: number
  feedback?: string
  submittedAt: Date
  gradedAt?: Date
}

export function GradeCard({
  title,
  score,
  maxScore,
  feedback,
  submittedAt,
  gradedAt,
}: GradeCardProps) {
  const percentage = score !== undefined ? (score / maxScore) * 100 : 0
  const isGraded = score !== undefined

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-accent'
    if (score >= 80) return 'text-blue-500'
    if (score >= 70) return 'text-yellow-500'
    if (score >= 60) return 'text-orange-500'
    return 'text-destructive'
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">
              Enviado: {submittedAt.toLocaleDateString('es-ES')}
            </p>
          </div>
          {isGraded && (
            <Badge className="ml-auto">Calificado</Badge>
          )}
        </div>

        {/* Score */}
        {isGraded && (
          <div className="flex items-center gap-4">
            <div>
              <p className={`text-3xl font-bold ${getGradeColor(score!)}`}>
                {score}
              </p>
              <p className="text-xs text-muted-foreground">
                de {maxScore} puntos
              </p>
            </div>
            <div className="flex-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {percentage.toFixed(0)}%
              </p>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium text-foreground mb-2">
              Comentarios del docente:
            </p>
            <p className="text-sm text-muted-foreground">{feedback}</p>
          </div>
        )}

        {/* Graded Date */}
        {gradedAt && (
          <p className="text-xs text-muted-foreground">
            Calificado: {gradedAt.toLocaleDateString('es-ES')}
          </p>
        )}
      </div>
    </Card>
  )
}
