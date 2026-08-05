'use client'

import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'
import { useEffect, useRef, useState } from 'react'
import { getTeacherProfile, updateTeacherProfile } from '@/lib/teacher/service'
import {
  Globe, DollarSign, MapPin, Languages, Camera, Save,
  CheckCircle2, Loader2,
} from 'lucide-react'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type Modality = 'virtual' | 'presencial' | 'hibrido'

const SPECIALTIES_SUGGESTIONS = [
  'Programación', 'Python', 'React', 'Machine Learning', 'Data Science',
  'Robótica', 'Matemáticas', 'Física', 'Estadística', 'Diseño UX',
  'Ciberseguridad', 'Bases de datos', 'Redes', 'DevOps', 'IA',
]

const LANGUAGES_OPTIONS = ['Español', 'Inglés', 'Portugués', 'Francés', 'Alemán']

const MODALITY_OPTIONS: { id: Modality; label: string; desc: string }[] = [
  { id: 'virtual',    label: 'Virtual',    desc: 'Sesiones por videollamada' },
  { id: 'presencial', label: 'Presencial', desc: 'En persona (Lima)' },
  { id: 'hibrido',    label: 'Híbrido',   desc: 'Virtual y presencial' },
]

export default function TeacherProfilePage() {
  const { isAllowed }  = useTeacherGuard()
  const didLoad        = useRef(false)
  const [loading,      setLoading]      = useState(true)
  const [name,         setName]         = useState('')
  const [bio,          setBio]          = useState('')
  const [university,   setUniversity]   = useState('')
  const [specialty,    setSpecialty]    = useState('')
  const [location,     setLocation]     = useState('')
  const [hourlyPrice,  setHourlyPrice]  = useState('')
  const [expYears,     setExpYears]     = useState('')
  const [languages,    setLanguages]    = useState<string[]>([])
  const [categories,   setCategories]   = useState<string[]>([])
  const [modality,     setModality]     = useState<Modality>('virtual')
  const [saved,        setSaved]        = useState(false)
  const [saving,       setSaving]       = useState(false)

  useEffect(() => {
    if (didLoad.current) return
    didLoad.current = true
    getTeacherProfile()
      .then((p) => {
        setBio(p.bio ?? '')
        setUniversity(p.university ?? '')
        setSpecialty(p.specialty ?? '')
        setLocation(p.location ?? '')
        setHourlyPrice(p.hourly_price ? String(p.hourly_price) : '')
        setExpYears(p.experience_years ? String(p.experience_years) : '')
        setLanguages(p.languages)
        setCategories(p.categories)
        setModality((p.modality as Modality) ?? 'virtual')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function toggleTag(list: string[], setList: (v: string[]) => void, tag: string) {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag])
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateTeacherProfile({
        bio,
        university,
        specialty,
        location,
        hourly_price: hourlyPrice ? parseFloat(hourlyPrice) : 0,
        experience_years: expYears ? parseInt(expYears, 10) : 0,
        languages,
        categories,
        modality,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch { /* silencioso */ }
    finally { setSaving(false) }
  }

  if (!isAllowed) return null
  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil profesional</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Este es el perfil que ven tus alumnos y la comunidad.</p>
          </div>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving
              ? <><Loader2 className="size-3.5 animate-spin" /> Guardando…</>
              : saved
              ? <><CheckCircle2 className="size-3.5 text-emerald-400" /> Guardado</>
              : <><Save className="size-3.5" /> Guardar</>}
          </Button>
        </div>
      </FadeIn>

      <Stagger className="space-y-4">

        {/* Identidad */}
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Identidad</h2>
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar name={name || 'P'} size="xl" />
                <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  <Camera className="size-3" />
                </button>
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Universidad / Institución</Label>
                    <Input value={university} onChange={(e) => setUniversity(e.target.value)} className="mt-1" placeholder="UTEC, PUCP..." />
                  </div>
                  <div>
                    <Label className="text-xs">Años de experiencia</Label>
                    <Input type="number" min="0" value={expYears} onChange={(e) => setExpYears(e.target.value)} className="mt-1" placeholder="4" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Especialidad principal</Label>
                  <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="mt-1" placeholder="Ej: Machine Learning, React..." />
                </div>
                <div>
                  <Label className="text-xs">Ubicación</Label>
                  <div className="relative mt-1">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input value={location} onChange={(e) => setLocation(e.target.value)} className="pl-8" placeholder="Lima, Perú" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Biografía */}
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Sobre mí</h2>
            <Label className="text-xs">Biografía</Label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Cuéntale a tus alumnos quién eres y qué puedes enseñarles..."
              className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </StaggerItem>

        {/* Categorías */}
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Categorías de enseñanza</h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleTag(categories, setCategories, s)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    categories.includes(s)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/60 hover:text-foreground'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* Configuración del servicio */}
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Configuración del servicio</h2>
            <div className="space-y-4">

              {/* Precio */}
              <div>
                <Label className="text-xs">Precio por hora (S/)</Label>
                <div className="relative mt-1">
                  <DollarSign className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="number"
                    value={hourlyPrice}
                    onChange={(e) => setHourlyPrice(e.target.value)}
                    className="pl-8"
                    min="10"
                    placeholder="80"
                  />
                </div>
              </div>

              {/* Modalidad */}
              <div>
                <Label className="text-xs mb-2 block">Modalidad</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {MODALITY_OPTIONS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setModality(m.id)}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-colors',
                        modality === m.id
                          ? 'border-primary bg-primary/8 ring-1 ring-primary/20'
                          : 'border-border hover:bg-muted/40'
                      )}
                    >
                      <p className={cn('text-xs font-semibold', modality === m.id ? 'text-primary' : 'text-foreground')}>{m.label}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Idiomas */}
              <div>
                <Label className="text-xs mb-2 block">Idiomas</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES_OPTIONS.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleTag(languages, setLanguages, lang)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors',
                        languages.includes(lang)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <Languages className="size-3" />{lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Botón guardar */}
        <StaggerItem>
          <Button onClick={handleSave} disabled={saving} className="w-full gap-2" size="lg">
            {saving
              ? <><Loader2 className="size-4 animate-spin" /> Guardando…</>
              : saved
              ? <><CheckCircle2 className="size-4" /> Perfil guardado</>
              : <><Save className="size-4" /> Guardar cambios</>}
          </Button>
        </StaggerItem>

      </Stagger>
    </div>
  )
}
