'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  AtSign,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Plus,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/common/Logo'
import { cn } from '@/lib/utils'
import {
  checkUsername,
  completeOnboarding,
  getOnboarding,
  saveStep1,
  saveStep2,
  saveStep3,
  type OnboardingData,
  type Step1Payload,
  type Step2Payload,
} from '@/lib/onboarding/service'
import { APP_ROUTES } from '@/lib/constants'

// ── Constantes ──────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'learn', label: 'Aprender', emoji: '📚' },
  { id: 'mentorship', label: 'Buscar mentoría', emoji: '🤝' },
  { id: 'teach', label: 'Enseñar y ganar dinero', emoji: '💰' },
  { id: 'team', label: 'Encontrar equipo para proyectos', emoji: '🚀' },
  { id: 'research', label: 'Investigación', emoji: '🔬' },
  { id: 'content', label: 'Ver contenido educativo', emoji: '🎬' },
] as const

const ACADEMIC_YEARS = [
  '1er ciclo', '2do ciclo', '3er ciclo', '4to ciclo', '5to ciclo',
  '6to ciclo', '7mo ciclo', '8vo ciclo', '9no ciclo', '10mo ciclo',
  'Egresado', 'Profesional',
]

const SUBJECT_SUGGESTIONS = [
  'Programación', 'Python', 'Java', 'C++', 'Cálculo', 'Álgebra',
  'Física', 'Química', 'Marketing', 'Finanzas', 'IA', 'Machine Learning',
  'Data Science', 'Diseño', 'UX', 'Ciberseguridad',
]

const PROJECT_SUGGESTIONS = [
  'IA', 'Startups', 'Investigación', 'Desarrollo Web', 'Apps móviles',
  'Blockchain', 'Robótica', 'Videojuegos', 'Computación Cuántica',
  'Biotecnología', 'Tesis',
]

const LEARNING_STYLES = [
  { id: 'short_videos', label: 'Videos cortos', emoji: '📱' },
  { id: 'live_classes', label: 'Clases en vivo', emoji: '🎥' },
  { id: 'practice', label: 'Ejercicios prácticos', emoji: '✏️' },
  { id: 'readings', label: 'Lecturas', emoji: '📖' },
  { id: 'projects', label: 'Proyectos', emoji: '🛠️' },
  { id: 'mentoring_1to1', label: 'Mentorías 1 a 1', emoji: '👥' },
] as const

// ── Animaciones ──────────────────────────────────────────────────────────────

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

const transition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }

// ── Componente raíz ──────────────────────────────────────────────────────────

export function OnboardingFlow({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0 = selección de rol, 1-3 = pasos originales
  const [dir, setDir] = useState(1)
  const [done, setDone] = useState(false)
  const [data, setData] = useState<OnboardingData | null>(null)
  const [intentRole, setIntentRole] = useState<'learn' | 'teach' | null>(null)
  const totalSteps = 4 // rol + 3 pasos

  useEffect(() => {
    getOnboarding()
      .then((d) => {
        setData(d)
        // Si ya pasó el paso 0 (rol), ir al paso correspondiente
        if (d.current_step > 1) setStep(d.current_step)
        else if (d.current_step === 1) setStep(1) // ya eligió rol, empezar desde step 1
      })
      .catch(() => {})
  }, [])

  const goNext = useCallback(
    (updated?: OnboardingData) => {
      if (updated) setData(updated)
      setDir(1)
      setStep((s) => s + 1)
    },
    []
  )

  const goBack = useCallback(() => {
    setDir(-1)
    setStep((s) => s - 1)
  }, [])

  const handleComplete = useCallback(async () => {
    await completeOnboarding()
    setDone(true)
    setTimeout(() => router.push(APP_ROUTES.DASHBOARD), 3000)
  }, [router])

  if (done) return <SuccessScreen />

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Logo className="h-10 w-auto" />
        <p className="text-sm text-muted-foreground">
          Configuremos tu experiencia personalizada
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Paso {step + 1} de {totalSteps}</span>
            <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
              initial={false}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {/* Step dots */}
          <div className="mt-3 flex justify-center gap-3">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300',
                  i < step
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : i === step
                      ? 'border-brand-500 bg-background text-brand-500'
                      : 'border-border bg-background text-muted-foreground'
                )}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transition}
            >
              {step === 0 && (
                <StepRole
                  onSelect={(role) => {
                    setIntentRole(role)
                    setDir(1)
                    setStep(1)
                  }}
                />
              )}
              {step === 1 && (
                <Step1
                  userEmail={userEmail}
                  initial={data}
                  onNext={goNext}
                />
              )}
              {step === 2 && (
                <Step2
                  initial={data}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}
              {step === 3 && (
                <Step3
                  initial={data}
                  onComplete={handleComplete}
                  onBack={goBack}
                  intentRole={intentRole}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ── Paso 1: Datos básicos ────────────────────────────────────────────────────

function Step1({
  userEmail,
  initial,
  onNext,
}: {
  userEmail: string
  initial: OnboardingData | null
  onNext: (data: OnboardingData) => void
}) {
  const [fullName, setFullName] = useState(initial?.full_name ?? '')
  const [username, setUsername] = useState(initial?.username ?? '')
  const [birthDate, setBirthDate] = useState(initial?.birth_date ?? '')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isEduEmail = useMemo(
    () => /\.(edu|edu\.[a-z]{2}|ac\.[a-z]{2})$/i.test(userEmail),
    [userEmail]
  )

  const handleUsernameChange = (v: string) => {
    setUsername(v)
    setUsernameStatus('idle')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (v.length >= 4 && /^[a-zA-Z0-9_]{4,30}$/.test(v)) {
      setUsernameStatus('checking')
      debounceRef.current = setTimeout(async () => {
        const res = await checkUsername(v).catch(() => null)
        setUsernameStatus(res?.available ? 'ok' : 'taken')
      }, 600)
    }
  }

  const age = useMemo(() => {
    if (!birthDate) return null
    const now = new Date()
    return Math.floor((now.getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  }, [birthDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (usernameStatus === 'taken') return setError('El nombre de usuario ya está en uso.')
    if (!fullName.trim() || !username.trim() || !birthDate) return setError('Completá todos los campos.')
    if (age !== null && age < 13) return setError('Debes tener al menos 13 años.')
    setSaving(true)
    try {
      const payload: Step1Payload = { full_name: fullName, username, birth_date: birthDate }
      const res = await saveStep1(payload)
      onNext(res)
    } catch (err) {
      setError((err as Error).message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 sm:p-8">
      <div>
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-xl bg-brand-500/10">
          <User className="size-5 text-brand-500" />
        </div>
        <h2 className="mt-3 text-xl font-bold text-foreground">Datos básicos</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Cuéntanos un poco sobre ti para personalizar tu experiencia.
        </p>
      </div>

      {/* Email (solo lectura) */}
      <div className="flex flex-col gap-1.5">
        <Label>Correo electrónico</Label>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
          <span className="flex-1 truncate text-sm text-foreground">{userEmail}</span>
          {isEduEmail && (
            <Badge variant="success" className="shrink-0 gap-1">
              <CheckCircle2 className="size-3" />
              Estudiante Verificado
            </Badge>
          )}
        </div>
        {isEduEmail && (
          <p className="text-xs text-success">
            ¡Tu correo institucional te da acceso a beneficios exclusivos!
          </p>
        )}
      </div>

      {/* Nombre completo */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre y apellido"
          required
          minLength={2}
        />
      </div>

      {/* Username */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Nombre de usuario</Label>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="username"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="tu_usuario"
            className="pl-9 pr-9"
            required
            minLength={4}
            maxLength={30}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {usernameStatus === 'checking' && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            {usernameStatus === 'ok' && <Check className="size-4 text-success" />}
            {usernameStatus === 'taken' && <X className="size-4 text-destructive" />}
          </div>
        </div>
        <p className={cn(
          'text-xs',
          usernameStatus === 'ok' && 'text-success',
          usernameStatus === 'taken' && 'text-destructive',
          usernameStatus === 'idle' || usernameStatus === 'checking' ? 'text-muted-foreground' : '',
        )}>
          {usernameStatus === 'ok' && '✓ Disponible'}
          {usernameStatus === 'taken' && '✗ Ya está en uso'}
          {(usernameStatus === 'idle' || usernameStatus === 'checking') &&
            'Solo letras, números y "_". Mínimo 4 caracteres.'}
        </p>
      </div>

      {/* Fecha de nacimiento */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="birthDate">Fecha de nacimiento</Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="pl-9"
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        {age !== null && age >= 13 && (
          <p className="text-xs text-muted-foreground">{age} años</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <Button
        type="submit"
        variant="brand"
        disabled={saving || usernameStatus === 'taken' || usernameStatus === 'checking'}
        className="mt-1 w-full gap-2"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : <>Continuar <ArrowRight className="size-4" /></>}
      </Button>
    </form>
  )
}

// ── Paso 2: Perfil académico ─────────────────────────────────────────────────

function Step2({
  initial,
  onNext,
  onBack,
}: {
  initial: OnboardingData | null
  onNext: (data: OnboardingData) => void
  onBack: () => void
}) {
  const [institution, setInstitution] = useState(initial?.institution ?? '')
  const [career, setCareer] = useState(initial?.career ?? '')
  const [academicYear, setAcademicYear] = useState(initial?.academic_year ?? '')
  const [goals, setGoals] = useState<string[]>(initial?.goals ?? [])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const toggleGoal = (id: string) =>
    setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!institution.trim() || !career.trim() || !academicYear) return setError('Completá todos los campos.')
    if (goals.length === 0) return setError('Seleccioná al menos un objetivo.')
    setSaving(true)
    try {
      const payload: Step2Payload = { institution, career, academic_year: academicYear, goals }
      const res = await saveStep2(payload)
      onNext(res)
    } catch (err) {
      setError((err as Error).message ?? 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 sm:p-8">
      <div>
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-xl bg-brand-500/10">
          <GraduationCap className="size-5 text-brand-500" />
        </div>
        <h2 className="mt-3 text-xl font-bold text-foreground">Perfil académico</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Esto nos ayuda a conectarte con los mejores profesores para tu carrera.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="institution">Universidad / Instituto / Colegio</Label>
        <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Ej: Universidad Nacional Mayor de San Marcos" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="career">Carrera</Label>
        <Input id="career" value={career} onChange={(e) => setCareer(e.target.value)} placeholder="Ej: Ingeniería de Sistemas" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="academicYear">Ciclo o año académico</Label>
        <select
          id="academicYear"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          required
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Seleccioná tu ciclo...</option>
          {ACADEMIC_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Objetivos */}
      <div className="flex flex-col gap-2">
        <Label>¿Qué buscás principalmente en Teduca?</Label>
        <p className="text-xs text-muted-foreground">Podés seleccionar varias opciones.</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GOALS.map((g) => {
            const selected = goals.includes(g.id)
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGoal(g.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl border p-3 text-left text-sm transition-all',
                  selected
                    ? 'border-brand-500 bg-brand-500/8 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-brand-400 hover:bg-muted/50',
                )}
              >
                <span className="text-base">{g.emoji}</span>
                <span className="flex-1 font-medium">{g.label}</span>
                {selected && <Check className="size-4 shrink-0 text-brand-500" />}
              </button>
            )
          })}
        </div>
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="size-4" /> Atrás
        </Button>
        <Button type="submit" variant="brand" disabled={saving} className="flex-1 gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <>Continuar <ArrowRight className="size-4" /></>}
        </Button>
      </div>
    </form>
  )
}

// ── Paso 3: Intereses ─────────────────────────────────────────────────────────

function Step3({
  initial,
  onComplete,
  onBack,
  intentRole,
}: {
  initial: OnboardingData | null
  onComplete: () => Promise<void>
  onBack: () => void
  intentRole?: 'learn' | 'teach' | null
}) {
  const [subjects, setSubjects] = useState<string[]>(initial?.subject_tags ?? [])
  const [projects, setProjects] = useState<string[]>(initial?.project_interests ?? [])
  const [styles, setStyles] = useState<string[]>(initial?.learning_styles ?? [])
  const [newSubject, setNewSubject] = useState('')
  const [newProject, setNewProject] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const toggleTag = (list: string[], setList: (v: string[]) => void, tag: string) =>
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag])

  const addCustomTag = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
    setValue: (v: string) => void,
  ) => {
    const t = value.trim()
    if (t && !list.includes(t) && list.length < 20) {
      setList([...list, t])
    }
    setValue('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (styles.length === 0) return setError('Seleccioná al menos un estilo de aprendizaje.')
    setSaving(true)
    try {
      await saveStep3({ subject_tags: subjects, project_interests: projects, learning_styles: styles })
      await onComplete()
    } catch (err) {
      setError((err as Error).message ?? 'Error al guardar.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 sm:p-8">
      <div>
        <div className="mb-1 inline-flex size-10 items-center justify-center rounded-xl bg-brand-500/10">
          <BookOpen className="size-5 text-brand-500" />
        </div>
        <h2 className="mt-3 text-xl font-bold text-foreground">Tus intereses</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Úsalo para descubrir profesores y contenido que te apasionan.
        </p>
      </div>

      {/* Materias */}
      <TagSection
        label="Materias favoritas"
        tags={subjects}
        suggestions={SUBJECT_SUGGESTIONS}
        onToggle={(t) => toggleTag(subjects, setSubjects, t)}
        newValue={newSubject}
        onNewChange={setNewSubject}
        onAdd={() => addCustomTag(newSubject, subjects, setSubjects, setNewSubject)}
        placeholder="Agregar materia..."
      />

      {/* Proyectos */}
      <TagSection
        label="Intereses de proyectos"
        tags={projects}
        suggestions={PROJECT_SUGGESTIONS}
        onToggle={(t) => toggleTag(projects, setProjects, t)}
        newValue={newProject}
        onNewChange={setNewProject}
        onAdd={() => addCustomTag(newProject, projects, setProjects, setNewProject)}
        placeholder="Agregar interés..."
      />

      {/* Estilo de aprendizaje */}
      <div className="flex flex-col gap-2">
        <Label>Estilo de aprendizaje</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LEARNING_STYLES.map((s) => {
            const selected = styles.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleTag(styles, setStyles, s.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition-all',
                  selected
                    ? 'border-brand-500 bg-brand-500/8 text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-brand-400',
                )}
              >
                <span className="text-xl">{s.emoji}</span>
                {s.label}
                {selected && <Check className="size-3 text-brand-500" />}
              </button>
            )
          })}
        </div>
      </div>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="size-4" /> Atrás
        </Button>
        <Button type="submit" variant="brand" disabled={saving} className="flex-1 gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <>Finalizar <Sparkles className="size-4" /></>}
        </Button>
      </div>
    </form>
  )
}

// ── TagSection (reutilizable) ─────────────────────────────────────────────────

function TagSection({
  label,
  tags,
  suggestions,
  onToggle,
  newValue,
  onNewChange,
  onAdd,
  placeholder,
}: {
  label: string
  tags: string[]
  suggestions: string[]
  onToggle: (tag: string) => void
  newValue: string
  onNewChange: (v: string) => void
  onAdd: () => void
  placeholder: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => {
          const active = tags.includes(s)
          return (
            <button
              key={s}
              type="button"
              onClick={() => onToggle(s)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                active
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-border bg-card text-muted-foreground hover:border-brand-400',
              )}
            >
              #{s}
            </button>
          )
        })}
        {tags.filter((t) => !suggestions.includes(t)).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onToggle(t)}
            className="flex items-center gap-1 rounded-full border border-brand-500 bg-brand-500 px-3 py-1 text-xs font-medium text-white"
          >
            #{t} <X className="size-2.5" />
          </button>
        ))}
      </div>
      {/* Input para tags personalizados */}
      <div className="flex gap-2">
        <Input
          value={newValue}
          onChange={(e) => onNewChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); onAdd() }
          }}
        />
        <Button type="button" variant="outline" size="icon" className="size-8 shrink-0" onClick={onAdd}>
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ── Paso 0: Selección de rol ──────────────────────────────────────────────────

function StepRole({ onSelect }: { onSelect: (role: 'learn' | 'teach') => void }) {
  const [selected, setSelected] = useState<'learn' | 'teach' | null>(null)

  const OPTIONS = [
    {
      id: 'learn' as const,
      emoji: '📚',
      label: 'Aprender',
      desc: 'Quiero descubrir cursos, conectar con mentores y crecer académicamente.',
      note: null,
    },
    {
      id: 'teach' as const,
      emoji: '🎓',
      label: 'Enseñar',
      desc: 'Quiero compartir mi conocimiento, dar mentorías y construir mi reputación.',
      note: 'Tu cuenta se creará como Alumno. Cuando quieras enseñar, solicita una evaluación desde el selector de plataforma.',
    },
  ]

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">¿Qué quieres hacer en TEDUCA?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Esto personaliza tu experiencia desde el primer día.
        </p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelected(opt.id)}
            className={cn(
              'w-full rounded-xl border p-4 text-left transition-all',
              selected === opt.id
                ? 'border-brand-500 bg-brand-500/8 ring-1 ring-brand-500/30'
                : 'border-border bg-card hover:border-brand-400/60 hover:bg-muted/40'
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{opt.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{opt.label}</p>
                  {selected === opt.id && (
                    <div className="flex size-5 items-center justify-center rounded-full bg-brand-500">
                      <Check className="size-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{opt.desc}</p>
                {opt.note && selected === opt.id && (
                  <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
                    ℹ️ {opt.note}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <Button
        variant="brand"
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
        className="gap-2"
      >
        Continuar <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}

// ── Pantalla de éxito ─────────────────────────────────────────────────────────

function SuccessScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="relative flex size-24 items-center justify-center"
        >
          <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/20" />
          <div className="relative flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-400 shadow-xl">
            <Sparkles className="size-10 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            ¡Todo listo!
          </h1>
          <p className="mt-2 max-w-xs text-muted-foreground">
            Estamos preparando una experiencia personalizada para ti.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Loader2 className="size-4 animate-spin" />
          Entrando al dashboard...
        </motion.div>
      </motion.div>
    </div>
  )
}
