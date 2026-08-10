'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  motion, AnimatePresence,
  useMotionValue, useTransform,
  type PanInfo,
} from 'framer-motion'
import {
  ArrowLeft, RotateCcw, Heart, X,
  Star, MapPin, Users, Clock, CheckCircle,
  GraduationCap, CalendarDays, Briefcase,
  Building2, Play, BookOpen,
  Globe, Coins,
  BadgeCheck, Wallet, Timer,
  Tag, Download, Eye,
  Zap, ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { getDiscoverDeck, resetDeck, swipeTeacher } from '@/lib/edtech/service'
import { formatPrice, MODALITY_LABEL } from '@/lib/format'
import type { TeacherProfile } from '@/lib/edtech/types'

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

type CategoryKey =
  | 'teachers' | 'courses' | 'hackathons' | 'events'
  | 'internships' | 'jobs' | 'networking' | 'materials'
  | 'videos' | 'competitions' | 'programs' | 'scholarships' | 'research'

interface SwipeCategory {
  key: CategoryKey
  label: string
  description: string
  emoji: string
  color: string
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: SwipeCategory[] = [
  { key: 'teachers',     label: 'Profesores',            description: 'Encuentra tu mentor ideal',          emoji: '👨‍🏫', color: 'from-blue-500/20 to-blue-500/5'    },
  { key: 'courses',      label: 'Cursos',                description: 'Aprende a tu ritmo',                 emoji: '🎓', color: 'from-emerald-500/20 to-emerald-500/5' },
  { key: 'hackathons',   label: 'Hackathons',            description: 'Compite y construye',                emoji: '🚀', color: 'from-violet-500/20 to-violet-500/5'   },
  { key: 'events',       label: 'Eventos',               description: 'Conferencias y talleres',            emoji: '📅', color: 'from-pink-500/20 to-pink-500/5'      },
  { key: 'internships',  label: 'Prácticas',             description: 'Experiencia profesional',            emoji: '💼', color: 'from-amber-500/20 to-amber-500/5'    },
  { key: 'jobs',         label: 'Empleos',               description: 'Oportunidades laborales',            emoji: '🏢', color: 'from-cyan-500/20 to-cyan-500/5'      },
  { key: 'networking',   label: 'Networking',            description: 'Conecta con personas clave',         emoji: '🤝', color: 'from-orange-500/20 to-orange-500/5'  },
  { key: 'materials',    label: 'Material de estudio',   description: 'PDFs, apuntes y guías',              emoji: '📚', color: 'from-teal-500/20 to-teal-500/5'     },
  { key: 'videos',       label: 'Videos educativos',     description: 'Aprende en minutos',                 emoji: '🎥', color: 'from-red-500/20 to-red-500/5'       },
  { key: 'competitions', label: 'Competencias',          description: 'Olimpiadas y torneos académicos',    emoji: '🏆', color: 'from-yellow-500/20 to-yellow-500/5'  },
  { key: 'programs',     label: 'Programas internacionales', description: 'Estudia en el mundo',            emoji: '🌎', color: 'from-indigo-500/20 to-indigo-500/5'  },
  { key: 'scholarships', label: 'Becas',                 description: 'Financia tu educación',              emoji: '💰', color: 'from-lime-500/20 to-lime-500/5'     },
  { key: 'research',     label: 'Investigación',         description: 'Líneas y laboratorios activos',      emoji: '🔬', color: 'from-fuchsia-500/20 to-fuchsia-500/5'},
]

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS (categorías no-profesores) — sin datos hardcodeados
// ─────────────────────────────────────────────────────────────────────────────

interface HackathonCard { id: string; title: string; org: string; prize: string; deadline: string; duration: string; team: string; tags: string[]; country: string; level: string; logo: string }
interface EventCard     { id: string; title: string; org: string; date: string; time: string; city: string; modality: string; attendees: number; description: string; tags: string[] }
interface JobCard       { id: string; title: string; company: string; modality: string; salary: string; tags: string[]; experience: string; logo: string; type: string }
interface NetworkCard   { id: string; name: string; university: string; career: string; interests: string[]; open_to: string[]; avatar?: string }
interface VideoCard     { id: string; title: string; author: string; university: string; duration: string; thumbnail: string; views: string; likes: number; category: string }
interface MaterialCard  { id: string; title: string; author: string; university: string; course: string; type: string; pages: number; downloads: number; year: string }
interface ScholarshipCard { id: string; title: string; university: string; country: string; amount: string; deadline: string; level: string; requirements: string[] }

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR GENÉRICO DE SWIPE
// ─────────────────────────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 100

interface SwipeEngineProps<T extends { id: string }> {
  items: T[]
  loading: boolean
  onSwipeRight: (item: T) => void
  onSwipeLeft: (item: T) => void
  onReset: () => void
  renderCard: (item: T, active: boolean, offset: number, onSwipe: (dir: 'left' | 'right') => void) => React.ReactNode
  emptyLabel?: string
}

function SwipeEngine<T extends { id: string }>({
  items, loading, onSwipeRight, onSwipeLeft, onReset, renderCard, emptyLabel,
}: SwipeEngineProps<T>) {
  const current = items[items.length - 1]

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative h-[520px] w-full" style={{ maxWidth: '420px' }}>
        {loading ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-border bg-card">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <EmptyDeck onReset={onReset} label={emptyLabel} />
        ) : (
          <AnimatePresence>
            {items.map((item, i) => (
              <div key={item.id} className="absolute inset-0">
                {renderCard(item, i === items.length - 1, items.length - 1 - i, (dir) => {
                  if (dir === 'right') onSwipeRight(item)
                  else onSwipeLeft(item)
                })}
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Botones de control */}
      {!loading && items.length > 0 && current && (
        <div className="mt-6 flex items-center gap-4">
          <ControlBtn label="Pasar" onClick={() => onSwipeLeft(current)} className="border-destructive/30 text-destructive hover:bg-destructive/10">
            <X className="size-6" />
          </ControlBtn>
          <ControlBtn label="Reiniciar" onClick={onReset} className="size-12 border-border text-muted-foreground hover:bg-muted">
            <RotateCcw className="size-5" />
          </ControlBtn>
          <ControlBtn label="Me interesa" onClick={() => onSwipeRight(current)} className="border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
            <Heart className="size-6" />
          </ControlBtn>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// WRAPPER DE TARJETA CON LÓGICA DE SWIPE (framer-motion)
// ─────────────────────────────────────────────────────────────────────────────

function DraggableCard({
  active, offset, onSwipe, children,
}: {
  active: boolean
  offset: number
  onSwipe: (dir: 'left' | 'right') => void
  children: React.ReactNode
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const likeOpacity = useTransform(x, [40, 130], [0, 1])
  const passOpacity = useTransform(x, [-130, -40], [1, 0])

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe('right')
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe('left')
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={active ? { x, rotate } : undefined}
      drag={active ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.55}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.94, y: 16, opacity: 0 }}
      animate={{ scale: 1 - offset * 0.04, y: offset * -10, opacity: offset > 2 ? 0 : 1 }}
      exit={{ x: x.get() > 0 ? 360 : -360, opacity: 0, transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
    >
      {/* Indicadores de dirección */}
      {active && (
        <>
          <motion.div style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-4 top-4 z-20 rotate-[-14deg] rounded-xl border-2 border-emerald-500 bg-emerald-500/10 px-3 py-1 text-base font-extrabold uppercase tracking-widest text-emerald-500 shadow-lg backdrop-blur-sm">
            Me interesa
          </motion.div>
          <motion.div style={{ opacity: passOpacity }}
            className="pointer-events-none absolute right-4 top-4 z-20 rotate-[14deg] rounded-xl border-2 border-destructive bg-destructive/10 px-3 py-1 text-base font-extrabold uppercase tracking-widest text-destructive shadow-lg backdrop-blur-sm">
            Pasar
          </motion.div>
        </>
      )}
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CARDS POR CATEGORÍA
// ─────────────────────────────────────────────────────────────────────────────

function TeacherSwipeCard({ teacher, active, offset, onSwipe }: { teacher: TeacherProfile; active: boolean; offset: number; onSwipe: (d: 'left'|'right') => void }) {
  return (
    <DraggableCard active={active} offset={offset} onSwipe={onSwipe}>
      <div className="h-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="relative h-[48%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={teacher.avatar} alt={teacher.name} className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent" />
          {teacher.rating >= 4.8 && (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-[11px] font-semibold text-primary-foreground backdrop-blur-sm">
              <BadgeCheck className="size-3" /> Top
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold leading-tight text-foreground">{teacher.name}</h3>
              <p className="text-sm text-muted-foreground">{teacher.specialty}</p>
              {teacher.university && <p className="text-xs text-muted-foreground/70">{teacher.university}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-warning/10 px-2 py-1">
              <Star className="size-3.5 fill-warning text-warning" />
              <span className="text-sm font-bold text-foreground">{teacher.rating}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="info">{MODALITY_LABEL[teacher.modality] ?? teacher.modality}</Badge>
            {teacher.categories.slice(0, 2).map((c) => <Badge key={c} variant="secondary">{c}</Badge>)}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="size-3.5" />{teacher.studentsCount.toLocaleString('es')}</span>
            <span className="flex items-center gap-1"><Clock className="size-3.5" />{teacher.experienceYears} años exp.</span>
            {teacher.location && <span className="flex items-center gap-1"><MapPin className="size-3.5" />{teacher.location}</span>}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-2">
            <div>
              <span className="text-base font-bold text-foreground">{formatPrice(teacher.hourlyPrice, teacher.currency)}</span>
              <span className="text-xs text-muted-foreground"> /hora</span>
            </div>
            <Link href={`/discover/${teacher.id}`} onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-xl border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              Ver perfil <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </DraggableCard>
  )
}

function HackathonSwipeCard({ item, active, offset, onSwipe }: { item: HackathonCard; active: boolean; offset: number; onSwipe: (d:'left'|'right')=>void }) {
  return (
    <DraggableCard active={active} offset={offset} onSwipe={onSwipe}>
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="bg-gradient-to-br from-violet-500/20 to-violet-500/5 p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-2xl shadow-sm">{item.logo}</div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{item.org}</p>
              <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[11px] font-semibold text-violet-500">{item.level}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold leading-snug text-foreground">{item.title}</h3>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Wallet, label: 'Premio', value: item.prize },
              { icon: Timer, label: 'Límite', value: item.deadline },
              { icon: Clock, label: 'Duración', value: item.duration },
              { icon: Users, label: 'Equipo', value: item.team },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-2.5">
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><Icon className="size-3" />{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((t) => <span key={t} className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-500">{t}</span>)}
          </div>
          <div className="mt-auto flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Globe className="size-3.5" />{item.country}</span>
            <button className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Participar</button>
          </div>
        </div>
      </div>
    </DraggableCard>
  )
}

function EventSwipeCard({ item, active, offset, onSwipe }: { item: EventCard; active: boolean; offset: number; onSwipe: (d:'left'|'right')=>void }) {
  return (
    <DraggableCard active={active} offset={offset} onSwipe={onSwipe}>
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="bg-gradient-to-br from-pink-500/20 to-pink-500/5 p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-[11px] font-semibold text-pink-500">{item.modality}</span>
            <span className="text-xs text-muted-foreground">{item.org}</span>
          </div>
          <h3 className="text-lg font-bold leading-snug text-foreground">{item.title}</h3>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: CalendarDays,  label: 'Fecha',     value: item.date },
              { icon: Clock,         label: 'Hora',      value: item.time },
              { icon: MapPin,        label: 'Ciudad',    value: item.city },
              { icon: Users,         label: 'Inscritos', value: `${item.attendees.toLocaleString()} personas` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-2.5">
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><Icon className="size-3" />{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{item.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((t) => <span key={t} className="rounded-full bg-pink-500/10 px-2 py-0.5 text-[11px] font-medium text-pink-500">{t}</span>)}
          </div>
          <button className="mt-auto w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Quiero asistir</button>
        </div>
      </div>
    </DraggableCard>
  )
}

function JobSwipeCard({ item, active, offset, onSwipe }: { item: JobCard; active: boolean; offset: number; onSwipe: (d:'left'|'right')=>void }) {
  return (
    <DraggableCard active={active} offset={offset} onSwipe={onSwipe}>
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-card text-2xl shadow-sm">{item.logo}</div>
            <div>
              <p className="text-sm font-semibold text-foreground">{item.company}</p>
              <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] font-semibold text-cyan-500">{item.type}</span>
            </div>
          </div>
          <h3 className="text-xl font-bold leading-snug text-foreground">{item.title}</h3>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Building2,  label: 'Modalidad',   value: item.modality    },
              { icon: Wallet,     label: 'Remuneración',value: item.salary      },
              { icon: Briefcase,  label: 'Tipo',        value: item.type        },
              { icon: Clock,      label: 'Experiencia', value: item.experience  },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-2.5">
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><Icon className="size-3" />{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((t) => <span key={t} className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[11px] font-medium text-cyan-500">{t}</span>)}
          </div>
          <button className="mt-auto w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Aplicar</button>
        </div>
      </div>
    </DraggableCard>
  )
}

function NetworkSwipeCard({ item, active, offset, onSwipe }: { item: NetworkCard; active: boolean; offset: number; onSwipe: (d:'left'|'right')=>void }) {
  const [connected, setConnected] = useState(false)
  return (
    <DraggableCard active={active} offset={offset} onSwipe={onSwipe}>
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 p-8 text-center">
          <Avatar name={item.name} size="lg" className="mx-auto mb-3" />
          <h3 className="text-xl font-bold text-foreground">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.career}</p>
          <p className="text-xs text-muted-foreground/70">{item.university}</p>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Intereses</p>
            <div className="flex flex-wrap gap-1.5">
              {item.interests.map((i) => <span key={i} className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[11px] font-medium text-orange-500">{i}</span>)}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Abierto a</p>
            <div className="flex flex-wrap gap-1.5">
              {item.open_to.map((o) => <span key={o} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">{o}</span>)}
            </div>
          </div>
          <button onClick={() => setConnected(p => !p)} className={cn('mt-auto w-full rounded-xl py-2.5 text-sm font-semibold transition-colors', connected ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90')}>
            {connected ? '✓ Conectado' : 'Conectar'}
          </button>
        </div>
      </div>
    </DraggableCard>
  )
}

function VideoSwipeCard({ item, active, offset, onSwipe }: { item: VideoCard; active: boolean; offset: number; onSwipe: (d:'left'|'right')=>void }) {
  return (
    <DraggableCard active={active} offset={offset} onSwipe={onSwipe}>
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="relative h-[52%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" draggable={false} />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="flex size-14 items-center justify-center rounded-full bg-white/90 shadow-xl">
              <Play className="size-6 fill-black text-black" />
            </div>
          </div>
          <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">{item.duration}</span>
          <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">{item.category}</span>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">{item.title}</h3>
          <div>
            <p className="text-sm font-medium text-foreground">{item.author}</p>
            <p className="text-xs text-muted-foreground">{item.university}</p>
          </div>
          <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="size-3.5" />{item.views}</span>
            <span className="flex items-center gap-1"><Heart className="size-3.5" />{item.likes.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </DraggableCard>
  )
}

function MaterialSwipeCard({ item, active, offset, onSwipe }: { item: MaterialCard; active: boolean; offset: number; onSwipe: (d:'left'|'right')=>void }) {
  return (
    <DraggableCard active={active} offset={offset} onSwipe={onSwipe}>
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="bg-gradient-to-br from-teal-500/20 to-teal-500/5 p-6">
          <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-card text-3xl shadow-sm">📄</div>
          <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[11px] font-semibold text-teal-500">{item.type}</span>
          <h3 className="mt-2 text-lg font-bold leading-snug text-foreground">{item.title}</h3>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: GraduationCap, label: 'Autor',      value: item.author      },
              { icon: Building2,     label: 'Universidad', value: item.university  },
              { icon: BookOpen,      label: 'Curso',       value: item.course      },
              { icon: Tag,           label: 'Páginas',     value: `${item.pages} pág.`},
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-2.5">
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><Icon className="size-3" />{label}</p>
                <p className="mt-0.5 truncate text-xs font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Download className="size-4" />
            <span>{item.downloads.toLocaleString()} descargas</span>
          </div>
          <button className="mt-auto w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Guardar material</button>
        </div>
      </div>
    </DraggableCard>
  )
}

function ScholarshipSwipeCard({ item, active, offset, onSwipe }: { item: ScholarshipCard; active: boolean; offset: number; onSwipe: (d:'left'|'right')=>void }) {
  return (
    <DraggableCard active={active} offset={offset} onSwipe={onSwipe}>
      <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        <div className="bg-gradient-to-br from-lime-500/20 to-lime-500/5 p-6">
          <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-card text-3xl shadow-sm">🎓</div>
          <span className="rounded-full bg-lime-500/15 px-2 py-0.5 text-[11px] font-semibold text-lime-600">{item.level}</span>
          <h3 className="mt-2 text-lg font-bold leading-snug text-foreground">{item.title}</h3>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Coins,       label: 'Monto',     value: item.amount     },
              { icon: CalendarDays,label: 'Límite',    value: item.deadline   },
              { icon: Globe,       label: 'País',      value: item.country    },
              { icon: Building2,   label: 'Institución',value: item.university.length > 16 ? item.university.slice(0,16)+'…' : item.university },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-2.5">
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><Icon className="size-3" />{label}</p>
                <p className="mt-0.5 text-xs font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Requisitos</p>
            <ul className="space-y-1">
              {item.requirements.map((r) => <li key={r} className="flex items-center gap-1.5 text-xs text-foreground"><CheckCircle className="size-3 shrink-0 text-lime-500" />{r}</li>)}
            </ul>
          </div>
          <button className="mt-auto w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Guardar beca</button>
        </div>
      </div>
    </DraggableCard>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS UI
// ─────────────────────────────────────────────────────────────────────────────

function ControlBtn({ children, label, onClick, className }: { children: React.ReactNode; label: string; onClick: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label}
      className={cn('inline-flex size-14 items-center justify-center rounded-full border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0', className)}>
      {children}
    </button>
  )
}

function EmptyDeck({ onReset, label }: { onReset: () => void; label?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
      <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-2xl">✨</div>
      <div>
        <p className="font-semibold text-foreground">¡Viste todo por ahora!</p>
        <p className="mt-1 text-sm text-muted-foreground">{label ?? 'Volvé más tarde o reiniciá el deck.'}</p>
      </div>
      <Button variant="outline" onClick={onReset}><RotateCcw className="size-4" />Reiniciar</Button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTOR DE CATEGORÍAS
// ─────────────────────────────────────────────────────────────────────────────

function CategorySelector({ onSelect }: { onSelect: (k: CategoryKey) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">¿Qué querés descubrir hoy?</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Elegí una categoría y comenzá a explorar con swipe.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.035, duration: 0.2 }}
            onClick={() => onSelect(cat.key)}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 text-left shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-200 group-hover:opacity-100', cat.color)} />
            <div className="relative">
              <span className="mb-2.5 block text-2xl">{cat.emoji}</span>
              <p className="text-sm font-semibold leading-tight text-foreground">{cat.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{cat.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function SwipePage() {
  const [selected, setSelected] = useState<CategoryKey | null>(null)

  // Estado teachers (API real)
  const [teachers, setTeachers]     = useState<TeacherProfile[]>([])
  const [loadingT, setLoadingT]     = useState(false)
  const [matchTeacher, setMatchT]   = useState<TeacherProfile | null>(null)

  // Categorías no-profesores: pendientes de endpoint backend — decks vacíos
  const [deckH, setDeckH] = useState<HackathonCard[]>([])
  const [deckE, setDeckE] = useState<EventCard[]>([])
  const [deckJ, setDeckJ] = useState<JobCard[]>([])
  const [deckN, setDeckN] = useState<NetworkCard[]>([])
  const [deckV, setDeckV] = useState<VideoCard[]>([])
  const [deckM, setDeckM] = useState<MaterialCard[]>([])
  const [deckS, setDeckS] = useState<ScholarshipCard[]>([])

  const loadTeachers = useCallback(async () => {
    setLoadingT(true)
    const d = await getDiscoverDeck().catch(() => [])
    setTeachers(d)
    setLoadingT(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (selected === 'teachers') void loadTeachers()
  }, [selected, loadTeachers])

  const cat = CATEGORIES.find((c) => c.key === selected)

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setSelected(null)} asChild={!selected}>
          {selected ? (
            <span className="flex items-center gap-1.5 cursor-pointer" onClick={() => setSelected(null)}>
              <ArrowLeft className="size-4" /> Volver
            </span>
          ) : (
            <Link href="/discover"><ArrowLeft className="size-4" />Descubrir</Link>
          )}
        </Button>
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          <h1 className="text-sm font-semibold text-foreground">Modo Swipe</h1>
          {cat && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-muted-foreground">{cat.emoji} {cat.label}</span>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── SELECTOR ── */}
        {!selected && (
          <motion.div key="selector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CategorySelector onSelect={setSelected} />
          </motion.div>
        )}

        {/* ── TEACHERS ── */}
        {selected === 'teachers' && (
          <motion.div key="teachers" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <p className="mb-6 text-center text-sm text-muted-foreground">Deslizá a la derecha si te interesa, a la izquierda para pasar.</p>
            <SwipeEngine
              items={teachers}
              loading={loadingT}
              onSwipeRight={async (t) => {
                setTeachers(p => p.filter(x => x.id !== t.id))
                const res = await swipeTeacher(t.id, 'right')
                if (res.matched) setMatchT(t)
              }}
              onSwipeLeft={(t) => setTeachers(p => p.filter(x => x.id !== t.id))}
              onReset={async () => { await resetDeck(); loadTeachers() }}
              renderCard={(t, active, offset, onSwipe) => (
                <TeacherSwipeCard key={t.id} teacher={t} active={active} offset={offset} onSwipe={onSwipe} />
              )}
            />
            {/* Match modal */}
            <AnimatePresence>
              {matchTeacher && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMatchT(null)}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
                  <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-xl">
                    <div className="aura pointer-events-none absolute inset-x-0 top-0 h-40" />
                    <div className="relative">
                      <p className="text-2xl font-extrabold tracking-tight text-primary">¡Es un match!</p>
                      <p className="mt-1 text-sm text-muted-foreground">Guardamos a {matchTeacher.name} en tus favoritos.</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={matchTeacher.avatar} alt={matchTeacher.name} className="mx-auto mt-4 size-20 rounded-2xl border-4 border-card object-cover shadow-md" />
                      <p className="mt-2 font-semibold text-foreground">{matchTeacher.name}</p>
                      <p className="text-sm text-muted-foreground">{matchTeacher.specialty}</p>
                      <div className="mt-5 flex flex-col gap-2">
                        <Button variant="brand" asChild><Link href={`/discover/${matchTeacher.id}`}>Solicitar una clase</Link></Button>
                        <Button variant="ghost" onClick={() => setMatchT(null)}>Seguir descubriendo</Button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── HACKATHONS ── */}
        {selected === 'hackathons' && (
          <motion.div key="hackathons" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <p className="mb-6 text-center text-sm text-muted-foreground">Encontrá hackathons que se ajusten a tu perfil.</p>
            <SwipeEngine items={deckH} loading={false} onSwipeRight={() => {}} onSwipeLeft={(h) => setDeckH(p => p.filter(x => x.id !== h.id))}
              onReset={() => setDeckH([])}
              renderCard={(h, active, offset, onSwipe) => <HackathonSwipeCard key={h.id} item={h} active={active} offset={offset} onSwipe={onSwipe} />} />
          </motion.div>
        )}

        {/* ── EVENTS ── */}
        {selected === 'events' && (
          <motion.div key="events" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <p className="mb-6 text-center text-sm text-muted-foreground">Conferencias, talleres y eventos cercanos a vos.</p>
            <SwipeEngine items={deckE} loading={false} onSwipeRight={() => {}} onSwipeLeft={(e) => setDeckE(p => p.filter(x => x.id !== e.id))}
              onReset={() => setDeckE([])}
              renderCard={(e, active, offset, onSwipe) => <EventSwipeCard key={e.id} item={e} active={active} offset={offset} onSwipe={onSwipe} />} />
          </motion.div>
        )}

        {/* ── INTERNSHIPS / JOBS ── */}
        {(selected === 'internships' || selected === 'jobs') && (
          <motion.div key="jobs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <p className="mb-6 text-center text-sm text-muted-foreground">Oportunidades laborales que coinciden con tu perfil.</p>
            <SwipeEngine items={deckJ} loading={false} onSwipeRight={() => {}} onSwipeLeft={(j) => setDeckJ(p => p.filter(x => x.id !== j.id))}
              onReset={() => setDeckJ([])}
              renderCard={(j, active, offset, onSwipe) => <JobSwipeCard key={j.id} item={j} active={active} offset={offset} onSwipe={onSwipe} />} />
          </motion.div>
        )}

        {/* ── NETWORKING ── */}
        {selected === 'networking' && (
          <motion.div key="networking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <p className="mb-6 text-center text-sm text-muted-foreground">Conectá con personas que comparten tus intereses.</p>
            <SwipeEngine items={deckN} loading={false} onSwipeRight={() => {}} onSwipeLeft={(n) => setDeckN(p => p.filter(x => x.id !== n.id))}
              onReset={() => setDeckN([])}
              renderCard={(n, active, offset, onSwipe) => <NetworkSwipeCard key={n.id} item={n} active={active} offset={offset} onSwipe={onSwipe} />} />
          </motion.div>
        )}

        {/* ── VIDEOS ── */}
        {selected === 'videos' && (
          <motion.div key="videos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <p className="mb-6 text-center text-sm text-muted-foreground">Videos educativos cortos para aprender en minutos.</p>
            <SwipeEngine items={deckV} loading={false} onSwipeRight={() => {}} onSwipeLeft={(v) => setDeckV(p => p.filter(x => x.id !== v.id))}
              onReset={() => setDeckV([])}
              renderCard={(v, active, offset, onSwipe) => <VideoSwipeCard key={v.id} item={v} active={active} offset={offset} onSwipe={onSwipe} />} />
          </motion.div>
        )}

        {/* ── MATERIALS ── */}
        {(selected === 'materials' || selected === 'courses') && (
          <motion.div key="materials" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <p className="mb-6 text-center text-sm text-muted-foreground">Material de estudio compartido por la comunidad.</p>
            <SwipeEngine items={deckM} loading={false} onSwipeRight={() => {}} onSwipeLeft={(m) => setDeckM(p => p.filter(x => x.id !== m.id))}
              onReset={() => setDeckM([])}
              renderCard={(m, active, offset, onSwipe) => <MaterialSwipeCard key={m.id} item={m} active={active} offset={offset} onSwipe={onSwipe} />} />
          </motion.div>
        )}

        {/* ── SCHOLARSHIPS / PROGRAMS / COMPETITIONS / RESEARCH ── */}
        {(selected === 'scholarships' || selected === 'programs' || selected === 'competitions' || selected === 'research') && (
          <motion.div key="scholarships" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
            <p className="mb-6 text-center text-sm text-muted-foreground">Becas y programas que pueden financiar tu educación.</p>
            <SwipeEngine items={deckS} loading={false} onSwipeRight={() => {}} onSwipeLeft={(s) => setDeckS(p => p.filter(x => x.id !== s.id))}
              onReset={() => setDeckS([])}
              renderCard={(s, active, offset, onSwipe) => <ScholarshipSwipeCard key={s.id} item={s} active={active} offset={offset} onSwipe={onSwipe} />} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
