'use client'

import { useTeacherGuard } from '@/lib/hooks/useTeacherGuard'

import { useState } from 'react'
import {
  User, Building2, GraduationCap, Globe, Link2, GitFork,
  DollarSign, Clock, MapPin, Languages, Camera, Save,
  Plus, X, CheckCircle2,
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
  // Datos del perfil (mock — en producción se cargan desde /api/v1/users/me)
  const [name,         setName]         = useState('Osmar Vilchez')
  const [bio,          setBio]          = useState('Desarrollador Fullstack con 4 años de experiencia en React, Next.js y FastAPI. Apasionado por la educación y el desarrollo de software.')
  const [institution,  setInstitution]  = useState('UTEC')
  const [career,       setCareer]       = useState('Ingeniería de Software')
  const [location,     setLocation]     = useState('Lima, Perú')
  const [pricePerHour, setPricePerHour] = useState('80')
  const [github,       setGithub]       = useState('osmar')
  const [linkedin,     setLinkedin]     = useState('osmar-vilchez')
  const [website,      setWebsite]      = useState('')
  const [specialties,  setSpecialties]  = useState<string[]>(['React', 'Next.js', 'Python', 'FastAPI'])
  const [languages,    setLanguages]    = useState<string[]>(['Español', 'Inglés'])
  const [modality,     setModality]     = useState<Modality>('hibrido')
  const [experience,   setExperience]   = useState('4 años desarrollando software. Experiencia como tutor universitario y mentor en bootcamps.')
  const [certifications, setCerts]      = useState<string[]>(['AWS Cloud Practitioner', 'Meta Front-End Developer'])
  const [newCert,      setNewCert]      = useState('')
  const [saved,        setSaved]        = useState(false)

  function toggleTag(list: string[], setList: (v: string[]) => void, tag: string) {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag])
  }

  function addCert() {
    const t = newCert.trim()
    if (t && !certifications.includes(t)) setCerts([...certifications, t])
    setNewCert('')
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <FadeIn>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil profesional</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Este es el perfil que ven tus alumnos y la comunidad.</p>
          </div>
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            {saved ? <><CheckCircle2 className="size-3.5 text-emerald-400" /> Guardado</> : <><Save className="size-3.5" /> Guardar</>}
          </Button>
        </div>
      </FadeIn>

      <Stagger className="space-y-4">

        {/* Foto y nombre */}
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Identidad</h2>
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar name={name} size="xl" />
                <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  <Camera className="size-3" />
                </button>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-xs">Nombre completo</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Universidad / Institución</Label>
                    <Input value={institution} onChange={(e) => setInstitution(e.target.value)} className="mt-1" placeholder="UTEC, PUCP..." />
                  </div>
                  <div>
                    <Label className="text-xs">Carrera</Label>
                    <Input value={career} onChange={(e) => setCareer(e.target.value)} className="mt-1" placeholder="Ingeniería de Software..." />
                  </div>
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
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Biografía</Label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Cuéntale a tus alumnos quién eres..."
                  className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
              <div>
                <Label className="text-xs">Experiencia</Label>
                <textarea
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={2}
                  placeholder="Años de experiencia, roles anteriores..."
                  className="mt-1 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Especialidades */}
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Especialidades</h2>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleTag(specialties, setSpecialties, s)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    specialties.includes(s)
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

        {/* Certificaciones */}
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Certificaciones</h2>
            <div className="mb-3 flex flex-wrap gap-2">
              {certifications.map((c) => (
                <span key={c} className="flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-xs font-medium text-primary">
                  <CheckCircle2 className="size-3" />{c}
                  <button onClick={() => setCerts(certifications.filter((x) => x !== c))} className="ml-0.5 opacity-60 hover:opacity-100">
                    <X className="size-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                placeholder="AWS, Google, Meta, Microsoft..."
                className="text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCert() } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addCert}>
                <Plus className="size-3.5" />
              </Button>
            </div>
          </div>
        </StaggerItem>

        {/* Configuración de servicio */}
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
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
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

        {/* Redes sociales */}
        <StaggerItem>
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold text-foreground">Redes y portafolio</h2>
            <div className="space-y-3">
              {[
                { icon: GitFork, label: 'GitHub', value: github,   set: setGithub,   prefix: 'github.com/',   placeholder: 'usuario' },
                { icon: Link2,   label: 'LinkedIn',value: linkedin, set: setLinkedin, prefix: 'linkedin.com/in/', placeholder: 'perfil' },
                { icon: Globe,   label: 'Sitio web',value: website, set: setWebsite,  prefix: '',              placeholder: 'https://...' },
              ].map(({ icon: Icon, label, value, set, prefix, placeholder }) => (
                <div key={label}>
                  <Label className="text-xs">{label}</Label>
                  <div className="relative mt-1 flex">
                    {prefix && (
                      <span className="flex items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground">
                        {prefix}
                      </span>
                    )}
                    <div className={cn('relative flex-1', !prefix && 'pl-0')}>
                      {!prefix && <Icon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />}
                      <Input
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        placeholder={placeholder}
                        className={cn(!prefix ? 'pl-8' : 'rounded-l-none')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </StaggerItem>

        {/* Botón guardar */}
        <StaggerItem>
          <Button onClick={handleSave} className="w-full gap-2" size="lg">
            {saved ? <><CheckCircle2 className="size-4" /> Perfil guardado</> : <><Save className="size-4" /> Guardar cambios</>}
          </Button>
        </StaggerItem>

      </Stagger>
    </div>
  )
}
