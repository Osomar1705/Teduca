'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  type PanInfo,
} from 'framer-motion'
import {
  Star,
  MapPin,
  Users,
  Clock,
  X,
  Heart,
  RotateCcw,
  MessageCircle,
  CalendarPlus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, MODALITY_LABEL } from '@/lib/format'
import {
  getDiscoverDeck,
  resetDeck,
  swipeTeacher,
} from '@/lib/edtech/service'
import type { SwipeDirection, TeacherProfile } from '@/lib/edtech/types'

const SWIPE_THRESHOLD = 120

export function SwipeDeck() {
  const [deck, setDeck] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [match, setMatch] = useState<TeacherProfile | null>(null)

  useEffect(() => {
    getDiscoverDeck().then((d) => {
      setDeck(d)
      setLoading(false)
    })
  }, [])

  async function handleSwipe(teacher: TeacherProfile, dir: SwipeDirection) {
    setDeck((prev) => prev.filter((t) => t.id !== teacher.id))
    const res = await swipeTeacher(teacher.id, dir)
    if (res.matched) setMatch(teacher)
  }

  async function handleReset() {
    setLoading(true)
    await resetDeck()
    const d = await getDiscoverDeck()
    setDeck(d)
    setLoading(false)
  }

  const current = deck[deck.length - 1]

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center">
      <div className="relative h-[560px] w-full">
        {loading ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-border bg-card">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : deck.length === 0 ? (
          <EmptyDeck onReset={handleReset} />
        ) : (
          <AnimatePresence>
            {deck.map((teacher, i) => (
              <SwipeCard
                key={teacher.id}
                teacher={teacher}
                active={i === deck.length - 1}
                offset={deck.length - 1 - i}
                onSwipe={handleSwipe}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Controles para PC */}
      {!loading && deck.length > 0 && current && (
        <div className="mt-6 flex items-center gap-4">
          <ControlButton
            label="No me interesa"
            onClick={() => handleSwipe(current, 'left')}
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <X className="size-6" />
          </ControlButton>
          <ControlButton
            label="Reiniciar"
            onClick={handleReset}
            className="size-12 border-border text-muted-foreground hover:bg-muted"
          >
            <RotateCcw className="size-5" />
          </ControlButton>
          <ControlButton
            label="Me interesa"
            onClick={() => handleSwipe(current, 'right')}
            className="border-success/30 text-success hover:bg-success/10"
          >
            <Heart className="size-6" />
          </ControlButton>
        </div>
      )}

      <MatchModal teacher={match} onClose={() => setMatch(null)} />
    </div>
  )
}

function SwipeCard({
  teacher,
  active,
  offset,
  onSwipe,
}: {
  teacher: TeacherProfile
  active: boolean
  offset: number
  onSwipe: (t: TeacherProfile, dir: SwipeDirection) => void
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-14, 14])
  const likeOpacity = useTransform(x, [40, 140], [0, 1])
  const nopeOpacity = useTransform(x, [-140, -40], [1, 0])

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) onSwipe(teacher, 'right')
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipe(teacher, 'left')
  }

  return (
    <motion.div
      className="absolute inset-0"
      style={active ? { x, rotate } : undefined}
      drag={active ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.94, y: 16, opacity: 0 }}
      animate={{
        scale: 1 - offset * 0.04,
        y: offset * -12,
        opacity: offset > 2 ? 0 : 1,
      }}
      exit={{ x: x.get() > 0 ? 320 : -320, opacity: 0, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
        {/* Foto */}
        <div className="relative h-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={teacher.avatar}
            alt={teacher.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent" />

          {active && (
            <>
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute left-5 top-5 rotate-[-12deg] rounded-lg border-2 border-success px-3 py-1 text-lg font-extrabold uppercase tracking-wider text-success"
              >
                Me interesa
              </motion.div>
              <motion.div
                style={{ opacity: nopeOpacity }}
                className="absolute right-5 top-5 rotate-[12deg] rounded-lg border-2 border-destructive px-3 py-1 text-lg font-extrabold uppercase tracking-wider text-destructive"
              >
                Paso
              </motion.div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex h-1/2 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold text-foreground">
                {teacher.name}
              </h3>
              <p className="truncate text-sm text-muted-foreground">
                {teacher.specialty}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Star className="size-4 fill-warning text-warning" />
              <span className="font-semibold">{teacher.rating}</span>
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
            {teacher.bio}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="info">{MODALITY_LABEL[teacher.modality]}</Badge>
            {teacher.categories.slice(0, 2).map((c) => (
              <Badge key={c} variant="secondary">
                {c}
              </Badge>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {teacher.studentsCount.toLocaleString('es-AR')}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {teacher.experienceYears} años
            </span>
            {teacher.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {teacher.location}
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
            <div>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(teacher.hourlyPrice, teacher.currency)}
              </span>
              <span className="text-xs text-muted-foreground"> / hora</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {teacher.courseIds.length} cursos
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function ControlButton({
  children,
  label,
  onClick,
  className,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex size-14 items-center justify-center rounded-full border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${className ?? ''}`}
    >
      {children}
    </button>
  )
}

function EmptyDeck({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
      <div className="bg-gradient-brand inline-flex size-14 items-center justify-center rounded-2xl text-white">
        <Heart className="size-6" />
      </div>
      <div>
        <p className="font-semibold text-foreground">¡Viste a todos por ahora!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Revisá tus favoritos o volvé a empezar.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="size-4" />
          Reiniciar
        </Button>
        <Button variant="brand" asChild>
          <Link href="/favorites">Ver favoritos</Link>
        </Button>
      </div>
    </div>
  )
}

function MatchModal({
  teacher,
  onClose,
}: {
  teacher: TeacherProfile | null
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {teacher && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-xl"
          >
            <div className="aura pointer-events-none absolute inset-x-0 top-0 h-40" />
            <div className="relative">
              <p className="text-gradient-brand text-2xl font-extrabold tracking-tight">
                ¡Es un match!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Guardamos a {teacher.name} en tus favoritos.
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className="mx-auto mt-5 size-24 rounded-2xl border-4 border-card object-cover shadow-md"
              />
              <p className="mt-3 font-semibold text-foreground">{teacher.name}</p>
              <p className="text-sm text-muted-foreground">{teacher.specialty}</p>

              <div className="mt-6 flex flex-col gap-2">
                <Button variant="brand" asChild>
                  <Link href={`/discover/${teacher.id}`}>
                    <CalendarPlus className="size-4" />
                    Solicitar una clase
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/messages?teacher=${teacher.id}`}>
                    <MessageCircle className="size-4" />
                    Enviar mensaje
                  </Link>
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Seguir descubriendo
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
