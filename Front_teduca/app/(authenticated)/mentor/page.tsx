'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Brain, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AcademicSummary } from '@/components/ai-mentor/AcademicSummary'
import { ProgressCard } from '@/components/ai-mentor/ProgressCard'
import { DailyRecommendation } from '@/components/ai-mentor/DailyRecommendation'
import { WeeklyGoalCard } from '@/components/ai-mentor/WeeklyGoalCard'
import { MentorChat } from '@/components/ai-mentor/MentorChat'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { getMentorData } from '@/lib/ai-mentor/service'
import { usePlatformStore } from '@/store/platformStore'
import { APP_ROUTES } from '@/lib/constants'
import type { MentorData } from '@/lib/ai-mentor/types'

export default function MentorPage() {
  const router = useRouter()
  const { mode } = usePlatformStore()
  const [data, setData] = useState<MentorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)

  // Redirect if teacher mode
  useEffect(() => {
    if (mode === 'profesor') {
      router.replace(APP_ROUTES.DASHBOARD)
    }
  }, [mode, router])

  useEffect(() => {
    if (mode === 'profesor') return
    getMentorData()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [mode])

  if (mode === 'profesor') return null

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <FadeIn>
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-2">
            <Brain className="size-5 text-primary" />
            <p className="text-sm font-medium text-primary">Mentor TEDUCA</p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {loading ? 'Cargando...' : `Hola, ${data?.context.userName.split(' ')[0] ?? 'estudiante'}.`}
          </h1>
          {!loading && data && (
            <p className="mt-1 text-muted-foreground">{data.greeting}</p>
          )}
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : data ? (
        <>
          <Stagger className="space-y-4">
            {/* Card 1: Resumen académico */}
            <StaggerItem>
              <AcademicSummary context={data.context} />
            </StaggerItem>

            {/* Card 2: Progreso */}
            <StaggerItem>
              <ProgressCard context={data.context} patterns={data.patterns} />
            </StaggerItem>

            {/* Card 3: Recomendación del día */}
            <StaggerItem>
              <DailyRecommendation recommendation={data.recommendation} />
            </StaggerItem>

            {/* Card 4: Objetivo semanal */}
            <StaggerItem>
              <WeeklyGoalCard weeklyGoal={data.weeklyGoal} />
            </StaggerItem>

            {/* Card 5: Chat CTA */}
            <StaggerItem>
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Conversar con el Mentor</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Hacé preguntas, pedí un plan de estudio o simplemente contame cómo vas.
                    </p>
                  </div>
                  <Button
                    variant="brand"
                    size="lg"
                    className="shrink-0"
                    onClick={() => setChatOpen(true)}
                  >
                    <MessageCircle className="size-4" />
                    Abrir chat
                  </Button>
                </div>
              </div>
            </StaggerItem>
          </Stagger>

          {/* Chat Panel */}
          {chatOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-start sm:pt-16">
              {/* Overlay */}
              <button
                type="button"
                aria-label="Cerrar chat"
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setChatOpen(false)}
              />
              {/* Panel */}
              <div className="relative z-10 flex h-[80svh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:h-[70svh]">
                <MentorChat context={data.context} onClose={() => setChatOpen(false)} />
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">No se pudo cargar la información del mentor.</p>
      )}
    </div>
  )
}
