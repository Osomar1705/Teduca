import { Zap, Star, Gem, BookOpen, CalendarCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MentorContext } from '@/lib/ai-mentor/types'

interface Props {
  context: MentorContext
}

export function AcademicSummary({ context }: Props) {
  const stats = [
    { label: 'XP Total',    value: context.xp,               icon: Zap,          color: 'text-yellow-500' },
    { label: 'Nivel',       value: context.level,             icon: Star,         color: 'text-primary'    },
    { label: 'Orbits',      value: context.orbits,            icon: Gem,          color: 'text-violet-500' },
    { label: 'Cursos',      value: context.coursesCount,      icon: BookOpen,     color: 'text-blue-500'   },
    { label: 'Mentorías',   value: context.reservationsCount, icon: CalendarCheck, color: 'text-emerald-500' },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Resumen académico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-xl bg-muted/40 px-3 py-3"
            >
              <Icon className={`size-4 ${color}`} />
              <p className="text-xl font-bold leading-none text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
