'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Heart, MessageCircle, Bookmark, Share2,
  MoreHorizontal, MapPin, ExternalLink, Calendar, Users,
  Zap, BookOpen, Briefcase, Globe, Award, Lightbulb, Rocket,
  X, Link as LinkIcon, Send, GitFork, Link2, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { ImageUploader, type PostImage } from '@/components/community/ImageUploader'
import { fetchPosts, createPost, toggleLike, toggleSave, type ApiPost } from '@/lib/community/service'

// ── Tipos ──────────────────────────────────────────────────────────────────

type Tab = 'feed' | 'networking'

type Category =
  | 'todo' | 'hackathons' | 'becas' | 'trabajo' | 'eventos'
  | 'cursos' | 'investigacion' | 'programas' | 'networking' | 'noticias'

interface Post {
  id: string
  author: { name: string; username: string; avatar?: string; role?: string; verified?: boolean }
  category: Category
  title?: string
  content: string
  tags: string[]
  location?: string
  deadline?: string
  link?: string
  image?: string
  likes: number
  comments: number
  saves: number
  timeAgo: string
}

interface Person {
  id: string
  name: string
  username: string
  university: string
  career: string
  specialty?: string
  interests: string[]
  goal?: string
  github?: string
  linkedin?: string
  open_to: ('mentoria' | 'proyectos' | 'trabajo')[]
}

// ── Constantes ─────────────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string; icon: React.ElementType }[] = [
  { key: 'todo',          label: 'Todo',          icon: Globe      },
  { key: 'hackathons',    label: 'Hackathons',    icon: Zap        },
  { key: 'becas',         label: 'Becas',         icon: Award      },
  { key: 'trabajo',       label: 'Trabajo',       icon: Briefcase  },
  { key: 'eventos',       label: 'Eventos',       icon: Calendar   },
  { key: 'cursos',        label: 'Cursos',        icon: BookOpen   },
  { key: 'investigacion', label: 'Investigación', icon: Lightbulb  },
  { key: 'programas',     label: 'Programas',     icon: Globe      },
  { key: 'networking',    label: 'Networking',    icon: Users      },
  { key: 'noticias',      label: 'Noticias',      icon: Rocket     },
]

const CAT_STYLE: Record<Category, { pill: string; dot: string }> = {
  todo:          { pill: 'bg-muted text-muted-foreground',                                    dot: 'bg-muted-foreground' },
  hackathons:    { pill: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',             dot: 'bg-violet-500'       },
  becas:         { pill: 'bg-amber-500/10  text-amber-600  dark:text-amber-400',              dot: 'bg-amber-500'        },
  trabajo:       { pill: 'bg-blue-500/10   text-blue-600   dark:text-blue-400',               dot: 'bg-blue-500'         },
  eventos:       { pill: 'bg-pink-500/10   text-pink-600   dark:text-pink-400',               dot: 'bg-pink-500'         },
  cursos:        { pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',          dot: 'bg-emerald-500'      },
  investigacion: { pill: 'bg-cyan-500/10   text-cyan-600   dark:text-cyan-400',               dot: 'bg-cyan-500'         },
  programas:     { pill: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',             dot: 'bg-indigo-500'       },
  networking:    { pill: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',             dot: 'bg-orange-500'       },
  noticias:      { pill: 'bg-rose-500/10   text-rose-600   dark:text-rose-400',               dot: 'bg-rose-500'         },
}

const OPEN_TO_STYLE: Record<string, string> = {
  mentoria:  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  proyectos: 'bg-blue-500/10   text-blue-600   dark:text-blue-400',
  trabajo:   'bg-amber-500/10  text-amber-600  dark:text-amber-400',
}

const OPEN_TO_LABEL: Record<string, string> = {
  mentoria: 'Mentoría', proyectos: 'Proyectos', trabajo: 'Trabajo',
}

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: { name: 'Google Developer Groups', username: 'gdg_peru', role: 'Organización verificada', verified: true },
    category: 'hackathons',
    title: 'Google Solution Challenge 2025',
    content: 'Estamos abriendo inscripciones para el Solution Challenge 2025. Teams de hasta 4 personas. Resuelve problemas reales usando tecnología Google. Premios globales y mentorías con Googlers.',
    tags: ['Google', 'Hackathon', 'IA', 'Desarrollo'],
    deadline: '15 mar 2025',
    link: 'developers.google.com',
    likes: 284, comments: 47, saves: 132, timeAgo: 'hace 2h',
  },
  {
    id: '2',
    author: { name: 'Ana Gutierrez', username: 'ana_g', role: 'Ing. de Sistemas · UTEC' },
    category: 'becas',
    title: 'Beca Fullbright 2025 — Maestría en USA',
    content: 'Acabo de terminar mi aplicación a Fullbright. Si alguien está en el proceso, con gusto comparto mi experiencia y reviso essays. El programa cubre tuition, vivienda y manutención completa.',
    tags: ['Fullbright', 'Posgrado', 'USA', 'Beca'],
    deadline: '30 abr 2025',
    likes: 156, comments: 38, saves: 201, timeAgo: 'hace 5h',
  },
  {
    id: '3',
    author: { name: 'UTEC Careers', username: 'utec_careers', role: 'Universidad', verified: true },
    category: 'trabajo',
    title: 'Prácticas en Mercado Libre — Ingeniería',
    content: 'Mercado Libre busca estudiantes de los últimos ciclos para prácticas en tecnología. Modalidad híbrida Lima. Remuneración competitiva + beneficios. Proceso abierto hasta el viernes.',
    tags: ['Prácticas', 'ML', 'Tecnología', 'Lima'],
    deadline: 'Viernes 7 feb',
    link: 'careers.mercadolibre.com',
    likes: 412, comments: 64, saves: 287, timeAgo: 'hace 1d',
  },
  {
    id: '4',
    author: { name: 'IEEE UTEC', username: 'ieee_utec', role: 'Club estudiantil', verified: true },
    category: 'eventos',
    title: 'Tech Talks: IA Generativa en producción',
    content: 'Este jueves presentamos casos reales de empresas peruanas usando IA generativa. Speakers de Rimac, Interbank y Yape. Presencial + streaming. Cupos limitados.',
    tags: ['IA', 'IEEE', 'Tech Talks', 'Lima'],
    deadline: 'Jueves 6 feb · 6pm',
    location: 'UTEC Auditorio A',
    likes: 98, comments: 22, saves: 74, timeAgo: 'hace 2d',
  },
  {
    id: '5',
    author: { name: 'Microsoft Student Club', username: 'ms_students', role: 'Organización', verified: true },
    category: 'programas',
    title: 'Microsoft Learn Student Ambassadors',
    content: 'Buscamos estudiantes apasionados por la tecnología para unirse al programa MLSA. Acceso a recursos Azure, certificaciones gratuitas, comunidad global y oportunidades de networking con Microsoft.',
    tags: ['Microsoft', 'Azure', 'Programa', 'Ambassadors'],
    deadline: '28 feb 2025',
    link: 'studentambassadors.microsoft.com',
    likes: 321, comments: 55, saves: 198, timeAgo: 'hace 3d',
  },
]

const MOCK_PEOPLE: Person[] = [
  { id: '1', name: 'Carlos Mendoza',  username: 'carlos_m',  university: 'PUCP',   career: 'Ciencia de Datos',        specialty: 'Machine Learning',   interests: ['IA','Python','Research','NLP'],             goal: 'Investigador en IA aplicada a salud',           linkedin: 'carlos-m',   github: 'carlos-m',   open_to: ['mentoria','proyectos'] },
  { id: '2', name: 'Valeria Torres',  username: 'val_torres', university: 'UPC',    career: 'Ingeniería de Software',  specialty: 'Frontend & UX',       interests: ['React','Startups','UX','Diseño'],           goal: 'Construir un producto SaaS educativo',          linkedin: 'val-torres',                       open_to: ['proyectos','trabajo']  },
  { id: '3', name: 'Diego Ríos',      username: 'diego_rios', university: 'UTEC',   career: 'Mecatrónica',             specialty: 'Robótica e IoT',      interests: ['Robótica','IoT','Hardware','Arduino'],      goal: 'Emprender en automatización industrial',                                github: 'diego-rios',  open_to: ['proyectos','mentoria'] },
  { id: '4', name: 'Sofía Ramírez',   username: 'sofia_r',    university: 'UNMSM',  career: 'Estadística',             specialty: 'Data Science',        interests: ['R','Python','Econometría','Visualización'], goal: 'Analista de datos en sector público',           linkedin: 'sofia-r',                          open_to: ['mentoria','trabajo']   },
  { id: '5', name: 'Andrés Castillo', username: 'andres_c',   university: 'UTEC',   career: 'Bioingeniería',           specialty: 'Imágenes médicas',    interests: ['CV','Salud','Deep Learning','DICOM'],       goal: 'Diagnóstico asistido por IA',                                          github: 'andres-c',    open_to: ['proyectos','mentoria'] },
  { id: '6', name: 'Lucía Vargas',    username: 'lucia_v',    university: 'USIL',   career: 'Administración',          specialty: 'Startups & Venture',  interests: ['Emprendimiento','Fintech','GTM','Marketing'],goal: 'Fundar una startup edtech en Latam',             linkedin: 'lucia-v',                          open_to: ['proyectos','trabajo']  },
]

const UPCOMING_EVENTS = [
  { id: '1', title: 'Google Solution Challenge', date: '15', month: 'mar', type: 'Hackathon', org: 'GDG'       },
  { id: '2', title: 'Tech Talks IEEE',            date: '6',  month: 'feb', type: 'Evento',    org: 'IEEE UTEC' },
  { id: '3', title: 'Feria Laboral UTEC',         date: '20', month: 'feb', type: 'Empleo',    org: 'UTEC'      },
]

const TRENDS = ['IAGenerativa','GoogleSolutionChallenge','Fullbright2025','ReactNative','Investigacion']

// ── Modal Crear Publicación ────────────────────────────────────────────────

function CreatePostModal({ onClose, onPublish }: { onClose: () => void; onPublish: (p: Post) => void }) {
  const [content,    setContent]    = useState('')
  const [category,   setCategory]   = useState<Category>('networking')
  const [tagsInput,  setTagsInput]  = useState('')
  const [link,       setLink]       = useState('')
  const [showLink,   setShowLink]   = useState(false)
  const [title,      setTitle]      = useState('')
  const [postImages, setPostImages] = useState<PostImage[]>([])
  const [publishing, setPublishing] = useState(false)

  const isUploading = postImages.some((img) => img.status === 'uploading')
  const hasError    = postImages.some((img) => img.status === 'error' && img.previewUrl !== '')
  const remaining   = 600 - content.length
  const canPublish  = content.trim().length > 0 && !isUploading && !publishing

  async function handlePublish() {
    if (!canPublish) return
    setPublishing(true)
    const tags       = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    const image_urls = postImages.filter((i) => i.status === 'done' && i.url).map((i) => i.url!)
    try {
      const apiPost = await createPost({
        content,
        category,
        title:      title.trim() || undefined,
        link:       link.trim() || undefined,
        tags,
        image_urls,
      })
      onPublish(apiToPost(apiPost))
      onClose()
    } catch {
      // Fallback: optimistic local post
      const primaryImage = postImages.find((img) => img.status === 'done' || img.previewUrl)
      onPublish({
        id: Date.now().toString(),
        author: { name: 'Tú', username: 'yo', role: 'Estudiante', verified: false },
        category, title: title.trim() || undefined, content, tags,
        link: link.trim() || undefined,
        image: primaryImage?.url ?? primaryImage?.previewUrl,
        likes: 0, comments: 0, saves: 0, timeAgo: 'ahora',
      })
      onClose()
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
      />

      {/* Modal — sin overflow-hidden para no interferir con el file dialog */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-post-title"
        className="relative z-10 flex w-full max-w-xl flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-3.5">
          <h2 id="new-post-title" className="text-sm font-semibold text-foreground">Nueva publicación</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar publicación"
            className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="max-h-[75vh] overflow-y-auto">
          <div className="space-y-4 p-5">

            {/* Categoría */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Categoría</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.filter((c) => c.key !== 'todo').map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={cn(
                      'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                      category === key
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="size-3" />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Título */}
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título (opcional)"
              className="font-medium"
            />

            {/* Texto */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué quieres compartir con la comunidad?"
                rows={4}
                className="w-full resize-none rounded-2xl border border-input bg-background/95 px-4 py-3 text-sm leading-relaxed shadow-xs outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
              <span className={cn(
                'absolute bottom-2.5 right-3 text-[10px]',
                remaining < 60 ? 'text-destructive' : 'text-muted-foreground/50'
              )}>
                {remaining}
              </span>
            </div>

            {/* ── Imágenes ── */}
            <ImageUploader onChange={setPostImages} maxImages={4} maxSizeMb={10} />

            {/* Enlace */}
            {showLink && (
              <div className="flex items-center gap-2">
                <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://enlace-externo.com"
                />
              </div>
            )}

            {/* Tags */}
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Etiquetas separadas por coma: Hackathon, IA, Lima"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 bg-muted/[0.02] px-5 py-3.5">
          <div className="flex items-center gap-1">
            {/* Botón Enlace */}
              <button
                type="button"
                onClick={() => setShowLink((p) => !p)}
                aria-pressed={showLink}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors',
                  showLink ? 'text-primary bg-primary/8' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <LinkIcon className="size-3.5" /> Enlace
            </button>

            {/* Indicador de subida */}
            {isUploading && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> Subiendo…
              </span>
            )}
            {hasError && !isUploading && (
              <span className="text-xs text-destructive">Algunas imágenes fallaron</span>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button
              size="sm"
              disabled={!canPublish}
              onClick={handlePublish}
              className="gap-1.5"
            >
              {isUploading || publishing
                ? <><Loader2 className="size-3.5 animate-spin" /> {isUploading ? 'Subiendo…' : 'Publicando…'}</>
                : <><Send className="size-3.5" /> Publicar</>
              }
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── CategoryBadge ──────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Category }) {
  const cat = CATEGORIES.find((c) => c.key === category)
  if (!cat || category === 'todo') return null
  const Icon = cat.icon
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', CAT_STYLE[category].pill)}>
      <Icon className="size-3" />{cat.label}
    </span>
  )
}

// ── PostCard ───────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked]   = useState(false)
  const [saved, setSaved]   = useState(false)
  const [likes, setLikes]   = useState(post.likes)
  const [saves, setSaves]   = useState(post.saves)
  const [expanded, setExp]  = useState(false)
  const isLong = post.content.length > 200

  async function handleLike() {
    setLiked((p) => !p)
    setLikes((p) => liked ? p - 1 : p + 1)
    try {
      const res = await toggleLike(post.id)
      setLiked(res.liked)
      setLikes(res.likes_count)
    } catch { /* keep optimistic */ }
  }

  async function handleSave() {
    setSaved((p) => !p)
    setSaves((p) => saved ? p - 1 : p + 1)
    try {
      const res = await toggleSave(post.id)
      setSaved(res.saved)
      setSaves(res.saves_count)
    } catch { /* keep optimistic */ }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-200 hover:border-border/80 hover:shadow-md">
      {/* Imagen al tope si la hay */}
      {post.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.image} alt="" className="aspect-video w-full object-cover" />
      )}

      <div className="p-5">
        {/* Autor */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium leading-none text-foreground">{post.author.name}</span>
                {post.author.verified && (
                  <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">✓</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{post.author.role} · {post.timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CategoryBadge category={post.category} />
            <button className="rounded-xl p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100">
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        {post.title && (
          <h3 className="mb-1.5 text-[15px] font-semibold leading-snug text-foreground">{post.title}</h3>
        )}
        <p className={cn('text-sm leading-relaxed text-muted-foreground', !expanded && isLong && 'line-clamp-3')}>
          {post.content}
        </p>
        {isLong && (
          <button onClick={() => setExp((p) => !p)} className="mt-1 text-xs font-medium text-primary hover:underline">
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}

        {/* Meta */}
        {(post.deadline || post.location || post.link) && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl bg-muted/50 px-3 py-2">
            {post.deadline && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />{post.deadline}
              </span>
            )}
            {post.location && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3" />{post.location}
              </span>
            )}
            {post.link && (
              <a href={`https://${post.link}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                <ExternalLink className="size-3" />{post.link}
              </a>
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="cursor-pointer rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-4 flex items-center gap-0.5 border-t border-border/60 pt-3">
          <button
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors',
              liked ? 'text-rose-500 hover:bg-rose-500/8' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Heart className={cn('size-3.5', liked && 'fill-current')} />{likes}
          </button>
          <button className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <MessageCircle className="size-3.5" />{post.comments}
          </button>
          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors',
              saved ? 'text-primary hover:bg-primary/8' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Bookmark className={cn('size-3.5', saved && 'fill-current')} />{saves}
          </button>
          <button className="ml-auto flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Share2 className="size-3.5" />Compartir
          </button>
        </div>
      </div>
    </article>
  )
}

// ── PersonCard ─────────────────────────────────────────────────────────────

function PersonCard({ person }: { person: Person }) {
  const [connected, setConnected] = useState(false)

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-xs transition-all duration-200 hover:border-border/80 hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <Avatar name={person.name} size="md" />
        <Button
          variant={connected ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 shrink-0 text-xs"
          onClick={() => setConnected((p) => !p)}
        >
          {connected ? '✓ Conectado' : 'Conectar'}
        </Button>
      </div>

      <p className="text-sm font-semibold text-foreground leading-tight">{person.name}</p>
      <p className="text-xs text-muted-foreground">@{person.username}</p>

      <div className="mt-1.5 space-y-0.5">
        <p className="text-xs text-foreground">{person.career}{person.specialty ? ` · ${person.specialty}` : ''}</p>
        <p className="text-xs text-muted-foreground">{person.university}</p>
      </div>

      {person.goal && (
        <p className="mt-2 line-clamp-2 text-xs italic text-muted-foreground">&ldquo;{person.goal}&rdquo;</p>
      )}

      <div className="mt-2.5 flex flex-wrap gap-1">
        {person.interests.slice(0, 3).map((i) => (
          <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{i}</span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2.5">
          {person.github && (
            <a href={`https://github.com/${person.github}`} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors">
              <GitFork className="size-3.5" />
            </a>
          )}
          {person.linkedin && (
            <a href={`https://linkedin.com/in/${person.linkedin}`} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors">
              <Link2 className="size-3.5" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {person.open_to.slice(0, 2).map((o) => (
            <span key={o} className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', OPEN_TO_STYLE[o])}>
              {OPEN_TO_LABEL[o]}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Panel lateral ──────────────────────────────────────────────────────────

function RightPanel({ onPublish }: { onPublish: () => void }) {
  return (
    <aside className="hidden w-64 shrink-0 xl:block">
      <div className="sticky top-20 flex flex-col gap-4">

        {/* Próximos eventos */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Próximos eventos</p>
          <div className="space-y-3">
            {UPCOMING_EVENTS.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/8 text-center leading-none">
                  <span className="text-[13px] font-bold text-primary">{ev.date}</span>
                  <span className="text-[9px] font-medium uppercase text-primary/60">{ev.month}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">{ev.title}</p>
                  <p className="text-[11px] text-muted-foreground">{ev.type} · {ev.org}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tendencias */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tendencias</p>
          <div className="space-y-2.5">
            {TRENDS.map((tag, i) => (
              <div key={tag} className="flex items-center justify-between group cursor-pointer">
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">#{tag}</span>
                <span className="text-[10px] text-muted-foreground/40">#{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onPublish}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Plus className="size-3.5" /> Compartir algo
        </button>

      </div>
    </aside>
  )
}

// ── Página ─────────────────────────────────────────────────────────────────

function apiToPost(a: ApiPost): Post {
  return {
    id:       a.id,
    author:   { name: a.author.name, username: a.author.id, avatar: a.author.avatar ?? undefined, role: undefined, verified: false },
    category: (a.category as Category) ?? 'todo',
    title:    a.title ?? undefined,
    content:  a.content,
    tags:     a.tags,
    location: a.location ?? undefined,
    deadline: a.deadline ?? undefined,
    link:     a.link ?? undefined,
    image:    a.image_urls[0] ?? undefined,
    likes:    a.likes_count,
    comments: a.comments_count,
    saves:    a.saves_count,
    timeAgo:  new Date(a.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
  }
}

export default function CommunityPage() {
  const [activeTab, setActiveTab]             = useState<Tab>('feed')
  const [activeCategory, setActiveCategory]   = useState<Category>('todo')
  const [search, setSearch]                   = useState('')
  const [netSearch, setNetSearch]             = useState('')
  const [showModal, setShowModal]             = useState(false)
  const [posts, setPosts]                     = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts]        = useState(true)
  const didFetch                               = useRef(false)

  const loadPosts = useCallback(async (category: Category, q: string) => {
    setLoadingPosts(true)
    try {
      const feed = await fetchPosts({ category, search: q || undefined, page_size: 50 })
      setPosts(feed.items.map(apiToPost))
    } catch {
      setPosts(MOCK_POSTS)
    } finally {
      setLoadingPosts(false)
    }
  }, [])

  useEffect(() => {
    if (didFetch.current) return
    didFetch.current = true
    loadPosts('todo', '')
  }, [loadPosts])

  useEffect(() => {
    if (!didFetch.current) return
    const t = setTimeout(() => loadPosts(activeCategory, search), 400)
    return () => clearTimeout(t)
  }, [activeCategory, search, loadPosts])

  async function handleNewPost(p: Post) {
    setPosts((prev) => [p, ...prev])
  }

  const filteredPosts = posts

  const filteredPeople = MOCK_PEOPLE.filter((p) => {
    const q = netSearch.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.career.toLowerCase().includes(q) || p.university.toLowerCase().includes(q) || p.interests.some((i) => i.toLowerCase().includes(q))
  })

  return (
    <div className="mx-auto max-w-6xl">

      <AnimatePresence>
        {showModal && <CreatePostModal onClose={() => setShowModal(false)} onPublish={handleNewPost} />}
      </AnimatePresence>

      {/* Header */}
      <FadeIn>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[1.9rem] font-bold tracking-tight text-foreground">Comunidad</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Oportunidades, eventos y personas del ecosistema educativo.
            </p>
          </div>
          <Button size="sm" onClick={() => setShowModal(true)} className="gap-1.5 shrink-0">
            <Plus className="size-4" /> Publicar
          </Button>
        </div>
      </FadeIn>

      {/* Tabs */}
      <FadeIn>
        <div className="mb-5 inline-flex w-full gap-1 rounded-2xl border border-border bg-muted/30 p-1">
          {([
            { key: 'feed',       label: 'Feed'       },
            { key: 'networking', label: 'Networking'  },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              aria-pressed={activeTab === t.key}
              className={cn(
                'flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                activeTab === t.key
                  ? 'bg-background text-primary shadow-xs'
                  : 'text-muted-foreground hover:bg-background/70 hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Contenido */}
      <AnimatePresence mode="wait">

        {/* ── FEED ── */}
        {activeTab === 'feed' && (
          <motion.div key="feed" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="flex gap-6">

            <div className="min-w-0 flex-1 space-y-4">
              {/* Buscador */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar publicaciones, eventos, oportunidades..."
                  className="h-10 w-full rounded-xl border border-input bg-background/95 pl-9 pr-4 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-ring focus:ring-3 focus:ring-ring/20"
                />
              </div>

              {/* Filtros */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                {CATEGORIES.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    aria-pressed={activeCategory === key}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                      activeCategory === key
                        ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                        : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="size-3" />{label}
                  </button>
                ))}
              </div>

              {/* Posts */}
              <AnimatePresence mode="wait">
                <motion.div key={activeCategory + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  {loadingPosts ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                        <Search className="size-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Sin resultados</p>
                      <p className="text-xs text-muted-foreground">Prueba con otro filtro o sé el primero en publicar</p>
                    </div>
                  ) : (
                    <Stagger className="flex flex-col gap-3">
                      {filteredPosts.map((post) => (
                        <StaggerItem key={post.id}>
                          <PostCard post={post} />
                        </StaggerItem>
                      ))}
                    </Stagger>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <RightPanel onPublish={() => setShowModal(true)} />
          </motion.div>
        )}

        {/* ── NETWORKING ── */}
        {activeTab === 'networking' && (
          <motion.div key="networking" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Descubre personas</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Estudiantes, investigadores y profesionales con intereses similares.</p>
            </div>
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={netSearch}
                onChange={(e) => setNetSearch(e.target.value)}
                placeholder="Buscar por nombre, carrera o interés..."
                className="h-10 w-full rounded-xl border border-input bg-background/95 pl-9 pr-4 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-ring focus:ring-3 focus:ring-ring/20"
              />
            </div>
            {filteredPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                  <Users className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Sin resultados</p>
                <p className="text-xs text-muted-foreground">Prueba con otro término</p>
              </div>
            ) : (
              <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPeople.map((person) => (
                  <StaggerItem key={person.id}><PersonCard person={person} /></StaggerItem>
                ))}
              </Stagger>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
