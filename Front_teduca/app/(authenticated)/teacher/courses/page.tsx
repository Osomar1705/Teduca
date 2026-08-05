'use client'

import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, BookOpen, Users, Star, Upload, Edit2, Trash2,
  MoreHorizontal, Video, FileText, ClipboardList, Eye, EyeOff,
} from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { cn } from '@/lib/utils'

type CourseStatus = 'published' | 'draft' | 'archived'

const COURSES = [
  {
    id: '1', title: 'React & Next.js para todos', description: 'Aprende React desde cero hasta nivel avanzado con proyectos reales.',
    students: 48, rating: 4.9, reviews: 32, status: 'published' as CourseStatus,
    materials: { videos: 24, pdfs: 8, tasks: 6 }, revenue: 'S/ 1,440', thumbnail: null,
  },
  {
    id: '2', title: 'Machine Learning con Python', description: 'Desde regresión lineal hasta redes neuronales. Enfoque práctico.',
    students: 36, rating: 4.8, reviews: 21, status: 'published' as CourseStatus,
    materials: { videos: 18, pdfs: 12, tasks: 4 }, revenue: 'S/ 1,080', thumbnail: null,
  },
  {
    id: '3', title: 'Robótica e IoT con Arduino', description: 'Construye proyectos de robótica e internet de las cosas desde cero.',
    students: 12, rating: 4.7, reviews: 8, status: 'draft' as CourseStatus,
    materials: { videos: 6, pdfs: 3, tasks: 2 }, revenue: 'S/ 360', thumbnail: null,
  },
]

const STATUS_STYLE: Record<CourseStatus, string> = {
  published: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  draft:     'bg-muted text-muted-foreground',
  archived:  'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}
const STATUS_LABEL: Record<CourseStatus, string> = {
  published: 'Publicado', draft: 'Borrador', archived: 'Archivado',
}

export default function TeacherCoursesPage() {
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Cursos</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{COURSES.length} cursos · {COURSES.reduce((a,c) => a+c.students,0)} alumnos en total</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="size-3.5" /> Crear curso
          </button>
        </div>
      </FadeIn>

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COURSES.map((c) => (
          <StaggerItem key={c.id}>
            <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-border/80 hover:shadow-sm">
              {/* Thumbnail */}
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                <BookOpen className="size-10 text-primary/30" />
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', STATUS_STYLE[c.status])}>
                    {STATUS_LABEL[c.status]}
                  </span>
                  <button className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-foreground">
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </div>

                <h3 className="mb-1 text-sm font-semibold leading-snug text-foreground">{c.title}</h3>
                <p className="mb-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">{c.description}</p>

                {/* Métricas */}
                <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="size-3" />{c.students}</span>
                  <span className="flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" />{c.rating}</span>
                  <span className="ml-auto font-medium text-emerald-600 dark:text-emerald-400">{c.revenue}</span>
                </div>

                {/* Materiales */}
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Video className="size-3" />{c.materials.videos}</span>
                  <span className="flex items-center gap-1"><FileText className="size-3" />{c.materials.pdfs}</span>
                  <span className="flex items-center gap-1"><ClipboardList className="size-3" />{c.materials.tasks}</span>
                </div>

                {/* Acciones */}
                <div className="mt-auto flex gap-1.5">
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Edit2 className="size-3" /> Editar
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Upload className="size-3" /> Material
                  </button>
                  <button className="flex items-center justify-center rounded-lg border border-border p-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    {c.status === 'published' ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
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
                <input placeholder="Título del curso" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" />
                <textarea placeholder="Descripción breve..." rows={3} className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring" />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowNew(false)} className="flex-1 rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">Cancelar</button>
                  <button className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">Crear</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
