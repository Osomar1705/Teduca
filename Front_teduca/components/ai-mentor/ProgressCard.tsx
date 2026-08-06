import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MentorContext } from '@/lib/ai-mentor/types'

interface Props {
  context: MentorContext
  patterns: string[]
}

// Derive strengths and areas from onboarding data + patterns
function deriveStrengths(ctx: MentorContext): string[] {
  const strengths: string[] = []
  if (ctx.streakDays >= 3) strengths.push(`Constancia (${ctx.streakDays} días de racha)`)
  if (ctx.reservationsCount > 0) strengths.push('Aprendizaje con mentor')
  if (ctx.subjects.length > 0) strengths.push(ctx.subjects[0])
  if (ctx.learningStyles.length > 0) strengths.push(ctx.learningStyles[0])
  if (strengths.length === 0) strengths.push('Motivación para comenzar')
  return strengths.slice(0, 4)
}

function deriveAreas(ctx: MentorContext): string[] {
  const areas: string[] = []
  if (ctx.reservationsCount === 0) areas.push('Reservar tu primera mentoría')
  if (ctx.weeklyXP < ctx.weeklyGoal * 0.5) areas.push('Aumentar actividad semanal')
  if (ctx.goals.length > 0 && ctx.reservationsCount === 0) areas.push(`Avanzar hacia: ${ctx.goals[0]}`)
  if (ctx.coursesCount === 0) areas.push('Iniciar un curso')
  if (areas.length === 0) areas.push('Mantener la consistencia')
  return areas.slice(0, 3)
}

export function ProgressCard({ context, patterns }: Props) {
  const strengths = deriveStrengths(context)
  const areas = deriveAreas(context)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Tu progreso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Fortalezas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {strengths.map((s) => (
              <Badge key={s} variant="success" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Áreas por mejorar
          </p>
          <div className="flex flex-wrap gap-1.5">
            {areas.map((a) => (
              <Badge key={a} variant="warning" className="text-xs">
                {a}
              </Badge>
            ))}
          </div>
        </div>

        {patterns.length > 0 && (
          <div className="space-y-1.5 border-t border-border/60 pt-3">
            {patterns.map((p) => (
              <p key={p} className="text-xs leading-relaxed text-muted-foreground">
                · {p}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
