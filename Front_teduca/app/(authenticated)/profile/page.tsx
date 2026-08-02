'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Check, Star, Users, Eye } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TagInput } from '@/components/edtech/TagInput'
import { FadeIn } from '@/components/common/Motion'
import {
  getMyProfile,
  saveMyProfile,
  getCoursesByTeacher,
} from '@/lib/edtech/service'
import { formatPrice, MODALITY_LABEL } from '@/lib/format'
import type {
  AvailabilitySlot,
  Course,
  Modality,
  SocialLink,
  SocialNetwork,
  TeacherProfile,
} from '@/lib/edtech/types'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const SOCIAL_TYPES: SocialNetwork[] = [
  'website',
  'linkedin',
  'twitter',
  'instagram',
  'youtube',
]

export default function ProfileEditorPage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getMyProfile().then((p) => {
      setProfile(p)
      // Solo los cursos que dicta este perfil (el catálogo global ya no aplica).
      getCoursesByTeacher(p.id).then(setCourses)
    })
  }, [])

  function set<K extends keyof TeacherProfile>(key: K, value: TeacherProfile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p))
    setSaved(false)
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    // saveMyProfile solo envía los campos editables; los agregados se ignoran.
    await saveMyProfile(profile)
    setSaving(false)
    setSaved(true)
  }

  if (!profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Mi perfil"
        description="Completá tu perfil profesional para que los estudiantes te encuentren."
        actions={
          <Button variant={saved ? 'success' : 'brand'} onClick={handleSave} disabled={saving}>
            {saved ? <Check className="size-4" /> : null}
            {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar cambios'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-foreground">Información básica</h2>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar}
                alt="Foto"
                className="size-20 rounded-2xl border border-border object-cover"
              />
              <div className="flex-1">
                <Label htmlFor="avatar">URL de foto</Label>
                <Input
                  id="avatar"
                  value={profile.avatar}
                  onChange={(e) => set('avatar', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo">
                <Input value={profile.name} onChange={(e) => set('name', e.target.value)} />
              </Field>
              <Field label="Especialidad">
                <Input
                  value={profile.specialty}
                  onChange={(e) => set('specialty', e.target.value)}
                  placeholder="Ej: Matemática · Cálculo"
                />
              </Field>
              <Field label="Universidad">
                <Input
                  value={profile.university}
                  onChange={(e) => set('university', e.target.value)}
                />
              </Field>
              <Field label="Ubicación">
                <Input
                  value={profile.location ?? ''}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Ciudad, País o Remoto"
                />
              </Field>
            </div>

            <Field label="Biografía" className="mt-4">
              <textarea
                value={profile.bio}
                onChange={(e) => set('bio', e.target.value)}
                rows={4}
                placeholder="Contá tu experiencia y tu forma de enseñar..."
                className="w-full resize-none rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/25"
              />
            </Field>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 font-semibold text-foreground">Enseñanza y tarifas</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Modalidad">
                <NativeSelect
                  value={profile.modality}
                  onChange={(v) => set('modality', v as Modality)}
                  options={[
                    { value: 'virtual', label: 'Virtual' },
                    { value: 'in-person', label: 'Presencial' },
                    { value: 'both', label: 'Virtual y Presencial' },
                  ]}
                />
              </Field>
              <Field label="Años de experiencia">
                <Input
                  type="number"
                  min={0}
                  value={profile.experienceYears}
                  onChange={(e) => set('experienceYears', Number(e.target.value))}
                />
              </Field>
              <Field label="Precio por hora">
                <Input
                  type="number"
                  min={0}
                  value={profile.hourlyPrice}
                  onChange={(e) => set('hourlyPrice', Number(e.target.value))}
                />
              </Field>
              <Field label="Moneda">
                <NativeSelect
                  value={profile.currency}
                  onChange={(v) => set('currency', v)}
                  options={[
                    { value: 'USD', label: 'USD' },
                    { value: 'ARS', label: 'ARS' },
                    { value: 'EUR', label: 'EUR' },
                  ]}
                />
              </Field>
            </div>

            <Field label="Idiomas" className="mt-4">
              <TagInput
                value={profile.languages}
                onChange={(v) => set('languages', v)}
                placeholder="Español, Inglés..."
              />
            </Field>
            <Field label="Categorías" className="mt-4">
              <TagInput
                value={profile.categories}
                onChange={(v) => set('categories', v)}
                placeholder="Matemática, Ciencias..."
              />
            </Field>
          </Card>

          {/* Cursos que enseña */}
          <Card className="p-6">
            <h2 className="mb-1 font-semibold text-foreground">Cursos que enseña</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {courses.length
                ? 'Estos son los cursos publicados en tu perfil.'
                : 'Todavía no tenés cursos publicados en tu perfil.'}
            </p>
            <div className="flex flex-wrap gap-2">
              {courses.map((c) => (
                <Badge key={c.id} variant="secondary" className="px-3 py-1.5 text-sm">
                  {c.title}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Horarios */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Horarios disponibles</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  set('availability', [
                    ...profile.availability,
                    { day: 'Lun', slots: [] },
                  ])
                }
              >
                <Plus className="size-4" />
                Agregar día
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              {profile.availability.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Sin horarios cargados todavía.
                </p>
              )}
              {profile.availability.map((slot, i) => (
                <div key={i} className="flex items-start gap-2">
                  <NativeSelect
                    value={slot.day}
                    onChange={(v) => updateAvailability(profile, set, i, { day: v })}
                    options={WEEKDAYS.map((d) => ({ value: d, label: d }))}
                    className="w-24 shrink-0"
                  />
                  <TagInput
                    value={slot.slots}
                    onChange={(v) => updateAvailability(profile, set, i, { slots: v })}
                    placeholder="09:00 - 12:00"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      set(
                        'availability',
                        profile.availability.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Redes */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Redes sociales (opcional)</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  set('socials', [
                    ...(profile.socials ?? []),
                    { type: 'website', url: '' },
                  ])
                }
              >
                <Plus className="size-4" />
                Agregar
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {(profile.socials ?? []).map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <NativeSelect
                    value={s.type}
                    onChange={(v) => updateSocial(profile, set, i, { type: v as SocialNetwork })}
                    options={SOCIAL_TYPES.map((t) => ({ value: t, label: t }))}
                    className="w-36 shrink-0 capitalize"
                  />
                  <Input
                    value={s.url}
                    onChange={(e) => updateSocial(profile, set, i, { url: e.target.value })}
                    placeholder="https://..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      set('socials', (profile.socials ?? []).filter((_, idx) => idx !== i))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Vista previa */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Eye className="size-3.5" />
              Vista previa
            </p>
            <FadeIn>
              <Card className="overflow-hidden p-0">
                <div className="bg-gradient-brand h-20" />
                <div className="px-5 pb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="-mt-8 size-16 rounded-2xl border-4 border-card object-cover shadow-md"
                  />
                  <h3 className="mt-2 font-semibold text-foreground">
                    {profile.name || 'Tu nombre'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.specialty || 'Tu especialidad'}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5 fill-warning text-warning" />
                      {profile.rating || '—'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {profile.studentsCount.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="info">{MODALITY_LABEL[profile.modality]}</Badge>
                    {profile.categories.slice(0, 2).map((c) => (
                      <Badge key={c} variant="secondary">
                        {c}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 text-lg font-bold text-foreground">
                    {formatPrice(profile.hourlyPrice, profile.currency)}
                    <span className="text-xs font-normal text-muted-foreground"> / hora</span>
                  </p>
                </div>
              </Card>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- helpers -----------------------------------------------------------------

type SetFn = <K extends keyof TeacherProfile>(k: K, v: TeacherProfile[K]) => void

function updateAvailability(
  profile: TeacherProfile,
  set: SetFn,
  index: number,
  patch: Partial<AvailabilitySlot>
) {
  set(
    'availability',
    profile.availability.map((s, i) => (i === index ? { ...s, ...patch } : s))
  )
}

function updateSocial(
  profile: TeacherProfile,
  set: SetFn,
  index: number,
  patch: Partial<SocialLink>
) {
  set(
    'socials',
    (profile.socials ?? []).map((s, i) => (i === index ? { ...s, ...patch } : s))
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  )
}

function NativeSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/25 ${className ?? 'w-full'}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
