'use client'

import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, BookOpen, Star, Upload, Edit2,
  MoreHorizontal,
} from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { getMyProfile, getCoursesByTeacher } from '@/lib/edtech/service'
import type { Course } from '@/lib/edtech/types'

export default function TeacherCoursesPage() {
  const { isAllowed } = useTeacherGuard()
  const [showNew, setShowNew] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAllowed) return
    async function load() {
      try {
        const profile = await getMyProfile()
        const cs = await getCoursesByTeacher(profile.id)
        setCourses(cs)
      } catch {
        // mantener vacío
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [isAllowed])

  if (!isAllowed) return null
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Cursos</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {loading ? 'Cargando…' : `${courses.length} cursos`}
            </p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-3.5" /> Crear curso
          </button>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <StaggerItem key={c.id}>
            <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-border/80 hover:shadow-sm">
              {/* Thumbnail */}
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <BookOpen className="size-10 text-primary/30" />
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {c.level}
                  </span>
                  <button className="rounded-xl p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground">
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </div>

                <h3 className="mb-1 text-sm font-semibold leading-snug text-foreground">{c.title}</h3>
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">{c.description}</p>

                {/* Métricas */}
                <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" />{c.rating.toFixed(1)}</span>
                  <span className="ml-auto font-medium text-emerald-600 dark:text-emerald-400">
                    {c.currency} {c.price}
                  </span>
                </div>

                {/* Duración */}
                <div className="mb-4 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  {c.durationHours}h · {c.category}
                </div>

                {/* Acciones */}
                <div className="mt-auto flex gap-1.5">
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Edit2 className="size-3" /> Editar
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Upload className="size-3" /> Material
                  </button>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}

        {/* Tarjeta "crear nuevo" */}
        <StaggerItem>
          <button
            onClick={() => setShowNew(true)}
            className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/20 hover:text-primary"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Plus className="size-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Crear nuevo curso</p>
              <p className="text-xs text-muted-foreground/70">Agrega videos, PDFs y tareas</p>
            </div>
          </button>
        </StaggerItem>
      </Stagger>

      {/* Modal crear curso (placeholder) */}
      <AnimatePresence>
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNew(false)}
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
            >
              <h2 className="mb-4 text-lg font-bold text-foreground">Nuevo curso</h2>
              <div className="space-y-3">
                <input placeholder="Título del curso" className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" />
                <textarea placeholder="Descripción breve..." rows={3} className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowNew(false)} className="flex-1 rounded-xl border border-border py-2 text-sm text-muted-foreground transition-colors hover:bg-muted">Cancelar</button>
                  <button className="flex-1 rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">Crear</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
