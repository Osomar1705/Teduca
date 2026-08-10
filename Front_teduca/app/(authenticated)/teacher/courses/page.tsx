'use client'

import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, BookOpen, Star, FileText, Video, Link2, FileImage,
  Trash2, Edit2, X, ExternalLink, ChevronDown, ChevronRight,
  Upload,
} from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { getMyProfile, getCoursesByTeacher } from '@/lib/edtech/service'
import { createMaterial, deleteMaterial, getMyMaterials } from '@/lib/materials/service'
import type { Course } from '@/lib/edtech/types'
import type { CourseMaterial, CourseMaterialCreate, MaterialType } from '@/lib/materials/types'

const TYPE_ICONS: Record<MaterialType, React.ReactNode> = {
  video: <Video className="size-4 text-blue-500" />,
  pdf: <FileText className="size-4 text-red-500" />,
  document: <FileText className="size-4 text-indigo-500" />,
  presentation: <FileImage className="size-4 text-orange-500" />,
  link: <Link2 className="size-4 text-emerald-500" />,
  other: <FileText className="size-4 text-muted-foreground" />,
}

const TYPE_LABELS: Record<MaterialType, string> = {
  video: 'Video',
  pdf: 'PDF',
  document: 'Documento',
  presentation: 'Presentación',
  link: 'Enlace',
  other: 'Otro recurso',
}

// ── Modal añadir material ────────────────────────────────────────────────────

function AddMaterialModal({
  courses,
  onClose,
  onSaved,
}: {
  courses: Course[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<Partial<CourseMaterialCreate>>({ materialType: 'link' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof CourseMaterialCreate, v: string | null) =>
    setForm((f) => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!form.title?.trim()) return setError('El título es obligatorio.')
    if (!form.url?.trim()) return setError('La URL es obligatoria.')
    if (!form.url.startsWith('http')) return setError('La URL debe comenzar con https://')
    setSaving(true)
    setError('')
    try {
      await createMaterial({
        title: form.title.trim(),
        url: form.url.trim(),
        materialType: (form.materialType as MaterialType) ?? 'link',
        description: form.description ?? null,
        marketplaceCourseId: form.marketplaceCourseId ?? null,
      })
      onSaved()
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar el material.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Añadir material</h2>
          <button onClick={onClose} className="rounded-xl p-1.5 text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Tipo */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Tipo</label>
            <select
              value={form.materialType ?? 'link'}
              onChange={(e) => set('materialType', e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            >
              {(Object.keys(TYPE_LABELS) as MaterialType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Título *</label>
            <input
              value={form.title ?? ''}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Ej: Clase 1 — Introducción"
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>

          {/* URL */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              URL (Google Drive o enlace externo) *
            </label>
            <input
              value={form.url ?? ''}
              onChange={(e) => set('url', e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Descripción <span className="font-normal text-muted-foreground/60">(opcional)</span>
            </label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
              placeholder="Breve descripción del contenido..."
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            />
          </div>

          {/* Curso (opcional) */}
          {courses.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Curso <span className="font-normal text-muted-foreground/60">(opcional)</span>
              </label>
              <select
                value={form.marketplaceCourseId ?? ''}
                onChange={(e) => set('marketplaceCourseId', e.target.value || null)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
              >
                <option value="">Sin asignar a un curso</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Lista de materiales de un curso ──────────────────────────────────────────

function CourseMaterialsList({
  courseId,
  materials,
  onDelete,
}: {
  courseId: string
  materials: CourseMaterial[]
  onDelete: (id: string) => void
}) {
  const courseMaterials = materials.filter(
    (m) => m.marketplaceCourseId === courseId || m.marketplaceCourseId === null
  )

  if (courseMaterials.length === 0) {
    return (
      <p className="px-3 py-2 text-xs text-muted-foreground">
        Sin materiales. Usa el botón «Material» para añadir uno.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {courseMaterials.map((m) => (
        <li key={m.id} className="flex items-center gap-2 px-3 py-2">
          {TYPE_ICONS[m.materialType]}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-foreground">{m.title}</p>
            {m.description && (
              <p className="truncate text-[11px] text-muted-foreground">{m.description}</p>
            )}
          </div>
          <a
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
          </a>
          <button
            onClick={() => onDelete(m.id)}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" />
          </button>
        </li>
      ))}
    </ul>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function TeacherCoursesPage() {
  const { isAllowed } = useTeacherGuard()
  const [courses, setCourses] = useState<Course[]>([])
  const [materials, setMaterials] = useState<CourseMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMaterial, setShowAddMaterial] = useState(false)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)

  async function load() {
    try {
      const profile = await getMyProfile()
      const [cs, ms] = await Promise.all([
        getCoursesByTeacher(profile.id),
        getMyMaterials(),
      ])
      setCourses(cs)
      setMaterials(ms)
    } catch {
      /* mantener vacío */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAllowed) return
    void load()
  }, [isAllowed])

  async function handleDeleteMaterial(id: string) {
    if (!confirm('¿Eliminar este material?')) return
    try {
      await deleteMaterial(id)
      setMaterials((prev) => prev.filter((m) => m.id !== id))
    } catch {
      alert('No se pudo eliminar el material.')
    }
  }

  if (!isAllowed) return null

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Cursos</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {loading ? 'Cargando…' : `${courses.length} ${courses.length === 1 ? 'curso' : 'cursos'}`}
            </p>
          </div>
          <button
            onClick={() => setShowAddMaterial(true)}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Upload className="size-3.5" /> Añadir material
          </button>
        </div>
      </FadeIn>

      {!loading && courses.length === 0 ? (
        <FadeIn>
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
            <BookOpen className="size-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium text-foreground">Aún no tienes cursos publicados</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Edita tu perfil de profesor para agregar cursos.
              </p>
            </div>
          </div>
        </FadeIn>
      ) : (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const isExpanded = expandedCourse === c.id
            const courseMaterialCount = materials.filter((m) => m.marketplaceCourseId === c.id).length
            return (
              <StaggerItem key={c.id}>
                <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-border/80 hover:shadow-sm">
                  <div className="flex h-24 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <BookOpen className="size-8 text-primary/30" />
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        {c.level}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {c.rating.toFixed(1)}
                      </span>
                    </div>

                    <h3 className="mb-1 text-sm font-semibold leading-snug text-foreground">{c.title}</h3>
                    <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {c.description}
                    </p>

                    <div className="mb-3 rounded-xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      {c.durationHours}h · {c.category} · {c.currency} {c.price}
                    </div>

                    {/* Toggle materiales */}
                    <button
                      onClick={() => setExpandedCourse(isExpanded ? null : c.id)}
                      className="mt-auto flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        {courseMaterialCount} materiales
                      </span>
                      {isExpanded
                        ? <ChevronDown className="size-3.5" />
                        : <ChevronRight className="size-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 overflow-hidden rounded-xl border border-border bg-muted/20">
                        <CourseMaterialsList
                          courseId={c.id}
                          materials={materials}
                          onDelete={handleDeleteMaterial}
                        />
                        <div className="border-t border-border px-3 py-2">
                          <button
                            onClick={() => setShowAddMaterial(true)}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Plus className="size-3" /> Añadir material a este curso
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </Stagger>
      )}

      {/* Materiales sin curso asignado */}
      {!loading && materials.filter((m) => m.marketplaceCourseId === null).length > 0 && (
        <FadeIn>
          <div className="rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-3">
              <h2 className="text-sm font-semibold text-foreground">Materiales generales</h2>
              <p className="text-xs text-muted-foreground">Sin asignar a un curso específico</p>
            </div>
            <CourseMaterialsList
              courseId="__general__"
              materials={materials.filter((m) => m.marketplaceCourseId === null).map((m) => ({
                ...m,
                marketplaceCourseId: '__general__',
              }))}
              onDelete={handleDeleteMaterial}
            />
          </div>
        </FadeIn>
      )}

      <AnimatePresence>
        {showAddMaterial && (
          <AddMaterialModal
            courses={courses}
            onClose={() => setShowAddMaterial(false)}
            onSaved={() => void load()}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
