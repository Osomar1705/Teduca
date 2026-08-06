'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Flame, GraduationCap, Building2, CalendarDays, UserCog,
  GitFork, Link2, Globe, Link as LinkIcon, Check, Copy,
  Upload, Camera, Briefcase, FlaskConical, Users,
  MapPin, ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { FadeIn } from '@/components/common/Motion'
import { LevelCard } from '@/components/dashboard/LevelCard'
import { AchievementCard } from '@/components/gamification/AchievementCard'
import { ProfileEditor } from '@/components/profile/ProfileEditor'
import { APP_ROUTES } from '@/lib/constants'
import { getCurrentUser, getReservations } from '@/lib/edtech/service'
import { getOnboarding, type OnboardingData } from '@/lib/onboarding/service'
import { getGamificationState } from '@/lib/gamification/service'
import { ACHIEVEMENTS } from '@/lib/gamification/achievements'
import { cn } from '@/lib/utils'
import type { GamificationState } from '@/lib/gamification/types'

type Tab = 'profile' | 'edit' | 'editor'

interface ExtendedProfile {
  name: string
  username?: string
  avatar?: string
  coverUrl?: string
  bio?: string
  institution?: string
  career?: string
  academicYear?: string
  location?: string
  specialty?: string
  goals: string[]
  subjects: string[]
  projects: string[]
  skills: string[]
  interests: string[]
  github?: string
  linkedin?: string
  portfolio?: string
  website?: string
  openToMentoring: boolean
  openToProjects: boolean
  openToWork: boolean
}

// ── Avatar Uploader ────────────────────────────────────────────────────────

function AvatarUploader({
  current,
  name,
  onChange,
}: {
  current?: string
  name: string
  onChange: (url: string) => void
}) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [urlInput, setUrlInput] = useState(current ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      onChange(result)
      setUrlInput(result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar src={urlInput || current} name={name} size="lg" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Camera className="size-3" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-1.5">
            {(['url', 'upload'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={cn(
                  'flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium transition-all',
                  mode === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {m === 'url' ? <><LinkIcon className="size-3" /> URL</> : <><Upload className="size-3" /> Subir</>}
              </button>
            ))}
          </div>
          {mode === 'url' ? (
            <Input
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); onChange(e.target.value) }}
              placeholder="https://tu-foto.com/avatar.jpg"
            />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-input text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
            >
              <Upload className="size-4" /> Seleccionar imagen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Cover Uploader ─────────────────────────────────────────────────────────

function CoverUploader({ current, onChange }: { current?: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [urlInput, setUrlInput] = useState(current ?? '')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      onChange(result)
      setUrlInput(result)
    }
    reader.readAsDataURL(file)
  }

  return (
      <div className="relative h-36 w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/20 to-primary/5">
      {urlInput && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={urlInput} alt="Portada" className="h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-background"
        >
          <Camera className="size-3.5" /> Cambiar portada
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      {urlInput && (
        <div className="absolute right-2 top-2">
          <Input
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); onChange(e.target.value) }}
            placeholder="URL de portada..."
            className="h-7 w-48 bg-background/80 text-xs backdrop-blur-sm"
          />
        </div>
      )}
    </div>
  )
}

// ── Tag Input simple ───────────────────────────────────────────────────────

function SimpleTagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')

  function add() {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed])
    setInput('')
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
        />
        <Button variant="outline" size="sm" onClick={add} type="button">Agregar</Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs">
              {v}
              <button onClick={() => onChange(value.filter((x) => x !== v))} className="text-muted-foreground hover:text-foreground">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Vista pública del perfil ───────────────────────────────────────────────

function ProfileView({ profile, game }: { profile: ExtendedProfile; game: GamificationState }) {
  const [copied, setCopied] = useState(false)
  const publicUrl = profile.username ? `teduca.app/u/${profile.username}` : null

  function copyUrl() {
    if (!publicUrl) return
    navigator.clipboard.writeText(`https://${publicUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        {/* Cover + Avatar */}
        <div className="relative">
          <div className="h-36 w-full overflow-hidden rounded-xl border border-border bg-gradient-to-br from-primary/20 to-primary/5">
            {profile.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.coverUrl} alt="Portada" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="absolute -bottom-8 left-5">
            <Avatar src={profile.avatar} name={profile.name} size="xl" className="ring-4 ring-background" />
          </div>
        </div>

        <div className="pt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar de perfil */}
          <aside className="space-y-5">
            <div>
              <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
              {profile.username && (
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  {publicUrl && (
                    <button onClick={copyUrl} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                      {copied ? 'Copiado' : 'Copiar URL'}
                    </button>
                  )}
                </div>
              )}
              {profile.bio && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>}
            </div>

            <div className="space-y-1.5">
              {profile.institution && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Building2 className="size-3.5 shrink-0 text-muted-foreground" />{profile.institution}
                </div>
              )}
              {profile.career && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <GraduationCap className="size-3.5 shrink-0 text-muted-foreground" />{profile.career}
                  {profile.specialty ? ` · ${profile.specialty}` : ''}
                </div>
              )}
              {profile.academicYear && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />{profile.academicYear}
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="size-3.5 shrink-0 text-muted-foreground" />{profile.location}
                </div>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="flex flex-wrap gap-1.5">
              {profile.openToMentoring && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Users className="size-3" /> Mentoría
                </span>
              )}
              {profile.openToProjects && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <FlaskConical className="size-3" /> Proyectos
                </span>
              )}
              {profile.openToWork && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Briefcase className="size-3" /> Trabajo
                </span>
              )}
            </div>

            {/* Redes sociales */}
            <div className="flex items-center gap-3">
              {profile.github && (
                <a href={`https://github.com/${profile.github.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <GitFork className="size-4" />
                </a>
              )}
              {profile.linkedin && (
                <a href={`https://linkedin.com/in/${profile.linkedin.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Link2 className="size-4" />
                </a>
              )}
              {profile.portfolio && (
                <a href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="size-4" />
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold text-foreground">{game.xp}</span>{' '}
                <span className="text-muted-foreground">XP</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <Flame className="size-3.5 text-orange-500" />
                <span className="font-semibold text-foreground">{game.streak.current}</span>{' '}
                <span className="text-muted-foreground">días</span>
              </div>
            </div>

            {/* Intereses */}
            {profile.interests.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Intereses</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* URL pública */}
            {publicUrl && (
              <div className="rounded-xl border border-border bg-muted/40 px-3 py-2.5">
                <p className="mb-1 text-xs font-medium text-muted-foreground">URL pública</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate text-xs font-medium text-foreground">{publicUrl}</p>
                  <button onClick={copyUrl} className="shrink-0 text-primary hover:text-primary/80">
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  </button>
                  <Link href={`/u/${profile.username}`} className="shrink-0 text-muted-foreground hover:text-foreground">
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </aside>

          {/* Contenido principal */}
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-base font-semibold text-foreground">Progreso académico</h2>
              <LevelCard xp={game.xp} level={game.level} />
            </section>

            {profile.skills.length > 0 && (
              <section>
                <h2 className="mb-3 text-base font-semibold text-foreground">Habilidades</h2>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </section>
            )}

            {profile.subjects.length > 0 && (
              <section>
                <h2 className="mb-3 text-base font-semibold text-foreground">Áreas de estudio</h2>
                <div className="flex flex-wrap gap-1.5">
                  {profile.subjects.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </section>
            )}

            {profile.goals.length > 0 && (
              <section>
                <h2 className="mb-3 text-base font-semibold text-foreground">Objetivos</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.goals.map((g) => (
                    <Badge key={g} variant="outline">{g}</Badge>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-3 text-base font-semibold text-foreground">Logros</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {ACHIEVEMENTS.slice(0, 4).map((a) => (
                  <AchievementCard key={a.id} achievement={a} />
                ))}
              </div>
            </section>

            {profile.goals.length === 0 && profile.subjects.length === 0 && profile.skills.length === 0 && (
              <EmptyState
                icon={UserCog}
                title="Completá tu perfil"
                description="Agrega habilidades, intereses y objetivos para que tu perfil sea visible en la comunidad."
                action={
                  <Button variant="brand" asChild>
                    <Link href={APP_ROUTES.ONBOARDING}>Completar</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

// ── Editor de Perfil Extendido ─────────────────────────────────────────────

function ExtendedProfileEdit({
  profile,
  onSave,
}: {
  profile: ExtendedProfile
  onSave: (p: ExtendedProfile) => void
}) {
  const [draft, setDraft] = useState<ExtendedProfile>(profile)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof ExtendedProfile>(key: K, value: ExtendedProfile[K]) {
    setDraft((p) => ({ ...p, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    onSave(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <FadeIn>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Editar perfil</h2>
          <p className="text-sm text-muted-foreground">Tu información aparecerá en la Comunidad y tu URL pública.</p>
        </div>
        <Button variant={saved ? 'success' : 'brand'} onClick={handleSave} className="gap-1.5">
          {saved ? <><Check className="size-4" /> Guardado</> : 'Guardar cambios'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identidad */}
        <Card className="p-5 space-y-5">
          <h3 className="font-semibold text-foreground">Foto y portada</h3>
          <div className="space-y-3">
            <Label>Foto de portada</Label>
            <CoverUploader current={draft.coverUrl} onChange={(v) => set('coverUrl', v)} />
          </div>
          <div className="space-y-2">
            <Label>Foto de perfil</Label>
            <AvatarUploader current={draft.avatar} name={draft.name} onChange={(v) => set('avatar', v)} />
          </div>
        </Card>

        {/* Información básica */}
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Información básica</h3>
          <Field label="Nombre completo">
            <Input value={draft.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Biografía">
            <textarea
              value={draft.bio ?? ''}
              onChange={(e) => set('bio', e.target.value)}
              rows={3}
              placeholder="Cuéntale a la comunidad quién eres..."
              className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/25"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Universidad">
              <Input value={draft.institution ?? ''} onChange={(e) => set('institution', e.target.value)} placeholder="UTEC, PUCP..." />
            </Field>
            <Field label="Carrera">
              <Input value={draft.career ?? ''} onChange={(e) => set('career', e.target.value)} placeholder="Ingeniería de Software..." />
            </Field>
            <Field label="Especialidad">
              <Input value={draft.specialty ?? ''} onChange={(e) => set('specialty', e.target.value)} placeholder="Machine Learning..." />
            </Field>
            <Field label="Ubicación">
              <Input value={draft.location ?? ''} onChange={(e) => set('location', e.target.value)} placeholder="Lima, Perú" />
            </Field>
          </div>
        </Card>

        {/* Habilidades e intereses */}
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Habilidades e intereses</h3>
          <Field label="Habilidades">
            <SimpleTagInput value={draft.skills} onChange={(v) => set('skills', v)} placeholder="Python, React, SQL..." />
          </Field>
          <Field label="Intereses">
            <SimpleTagInput value={draft.interests} onChange={(v) => set('interests', v)} placeholder="IA, Startups, Diseño..." />
          </Field>
        </Card>

        {/* Redes sociales */}
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Redes y portafolio</h3>
          <Field label="GitHub">
            <div className="flex items-center gap-2">
              <GitFork className="size-4 shrink-0 text-muted-foreground" />
              <Input value={draft.github ?? ''} onChange={(e) => set('github', e.target.value)} placeholder="usuario" />
            </div>
          </Field>
          <Field label="LinkedIn">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 shrink-0 text-muted-foreground" />
              <Input value={draft.linkedin ?? ''} onChange={(e) => set('linkedin', e.target.value)} placeholder="usuario" />
            </div>
          </Field>
          <Field label="Portafolio">
            <div className="flex items-center gap-2">
              <Globe className="size-4 shrink-0 text-muted-foreground" />
              <Input value={draft.portfolio ?? ''} onChange={(e) => set('portfolio', e.target.value)} placeholder="https://mi-portfolio.com" />
            </div>
          </Field>
          <Field label="Sitio web">
            <div className="flex items-center gap-2">
              <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
              <Input value={draft.website ?? ''} onChange={(e) => set('website', e.target.value)} placeholder="https://..." />
            </div>
          </Field>
        </Card>

        {/* Disponibilidad */}
        <Card className="p-5 space-y-4 lg:col-span-2">
          <h3 className="font-semibold text-foreground">Disponibilidad</h3>
          <p className="text-sm text-muted-foreground">Indica en qué estás disponible para que otros usuarios puedan conectar contigo.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { key: 'openToMentoring', label: 'Mentoría', icon: Users, desc: 'Disponible para dar o recibir mentorías' },
              { key: 'openToProjects', label: 'Proyectos', icon: FlaskConical, desc: 'Abierto a colaborar en proyectos' },
              { key: 'openToWork', label: 'Trabajo', icon: Briefcase, desc: 'Buscando oportunidades laborales' },
            ] as { key: keyof ExtendedProfile; label: string; icon: React.ElementType; desc: string }[]).map(({ key, label, icon: Icon, desc }) => {
              const active = Boolean(draft[key])
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => set(key, !active as ExtendedProfile[typeof key])}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
                    active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  )}
                >
                  <div className={cn('flex size-8 items-center justify-center rounded-xl', active ? 'bg-primary/10' : 'bg-muted')}>
                    <Icon className={cn('size-4', active ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <p className={cn('text-sm font-medium', active ? 'text-primary' : 'text-foreground')}>{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  {active && <Check className="size-4 text-primary self-end mt-auto" />}
                </button>
              )
            })}
          </div>
        </Card>
      </div>
    </FadeIn>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  )
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('profile')
  const [profile, setProfile] = useState<ExtendedProfile | null>(null)
  const [game] = useState<GamificationState | null>(getGamificationState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser().catch(() => ({
        name: 'Estudiante',
        avatar: undefined,
      }))
      const onboarding = await getOnboarding().catch(() => null as OnboardingData | null)
      getReservations().catch(() => {})
      setProfile({
        name: onboarding?.full_name || user.name,
        avatar: user.avatar,
        username: onboarding?.username ?? undefined,
        institution: onboarding?.institution ?? undefined,
        career: onboarding?.career ?? undefined,
        academicYear: onboarding?.academic_year ?? undefined,
        goals: onboarding?.goals ?? [],
        subjects: onboarding?.subject_tags ?? [],
        projects: onboarding?.project_interests ?? [],
        skills: [],
        interests: [],
        openToMentoring: false,
        openToProjects: false,
        openToWork: false,
      })
      setLoading(false)
    }
    load().catch(() => {
      setProfile({
        name: 'Estudiante',
        avatar: undefined,
        skills: [],
        subjects: [],
        projects: [],
        interests: [],
        goals: [],
        openToMentoring: false,
        openToProjects: false,
        openToWork: false,
      })
      setLoading(false)
    })
  }, [])

  const TABS: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Mi Perfil' },
    { key: 'edit', label: 'Editar Perfil' },
    { key: 'editor', label: 'Editor Avanzado' },
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex gap-0 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'editor' ? (
        <ProfileEditor />
      ) : loading || !profile || !game ? (
        <div className="space-y-6">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : tab === 'edit' ? (
        <ExtendedProfileEdit profile={profile} onSave={(p) => { setProfile(p); setTab('profile') }} />
      ) : (
        <ProfileView profile={profile} game={game} />
      )}
    </div>
  )
}
