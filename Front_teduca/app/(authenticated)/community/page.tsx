'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  MapPin,
  ExternalLink,
  Calendar,
  Users,
  Zap,
  BookOpen,
  Briefcase,
  Globe,
  Award,
  Lightbulb,
  Rocket,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  ChevronDown,
  GitFork,
  Link2,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'

// ── Tipos ──────────────────────────────────────────────────────────────────

type Tab = 'feed' | 'networking'

type Category =
  | 'todo' | 'hackathons' | 'becas' | 'trabajo' | 'eventos'
  | 'cursos' | 'investigacion' | 'programas' | 'networking' | 'noticias'

interface Post {
  id: string
  author: { name: string; username: string; avatar?: string; university?: string; role?: string; verified?: boolean }
  category: Category
  title?: string
  content: string
  tags: string[]
  location?: string
  deadline?: string
  link?: string
  likes: number
  comments: number
  saves: number
  timeAgo: string
}

interface Person {
  id: string
  name: string
  username: string
  avatar?: string
  university: string
  career: string
  specialty?: string
  interests: string[]
  goal?: string
  github?: string
  linkedin?: string
  open_to: ('mentoria' | 'proyectos' | 'trabajo')[]
}

// ── Datos mock ─────────────────────────────────────────────────────────────

const CATEGORIES: { key: Category; label: string; icon: React.ElementType }[] = [
  { key: 'todo', label: 'Todo', icon: Globe },
  { key: 'hackathons', label: 'Hackathons', icon: Zap },
  { key: 'becas', label: 'Becas', icon: Award },
  { key: 'trabajo', label: 'Trabajo', icon: Briefcase },
  { key: 'eventos', label: 'Eventos', icon: Calendar },
  { key: 'cursos', label: 'Cursos', icon: BookOpen },
  { key: 'investigacion', label: 'Investigación', icon: Lightbulb },
  { key: 'programas', label: 'Programas', icon: Globe },
  { key: 'networking', label: 'Networking', icon: Users },
  { key: 'noticias', label: 'Noticias', icon: Rocket },
]

const CATEGORY_COLORS: Record<Category, string> = {
  todo: 'bg-muted text-muted-foreground',
  hackathons: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  becas: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  trabajo: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  eventos: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  cursos: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  investigacion: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  programas: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  networking: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  noticias: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

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
    author: { name: 'Ana Gutierrez', username: 'ana_g', university: 'UTEC', role: 'Ing. de Sistemas · 5to año' },
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
  {
    id: '1', name: 'Carlos Mendoza', username: 'carlos_m',
    university: 'PUCP', career: 'Ciencia de Datos', specialty: 'Machine Learning',
    interests: ['IA', 'Python', 'Research', 'NLP'],
    goal: 'Investigador en IA aplicada a salud',
    linkedin: 'linkedin.com/in/carlos-m', github: 'github.com/carlos-m',
    open_to: ['mentoria', 'proyectos'],
  },
  {
    id: '2', name: 'Valeria Torres', username: 'val_torres',
    university: 'UPC', career: 'Ingeniería de Software', specialty: 'Frontend & UX',
    interests: ['React', 'Startups', 'UX', 'Diseño'],
    goal: 'Construir un producto SaaS educativo',
    linkedin: 'linkedin.com/in/val-torres',
    open_to: ['proyectos', 'trabajo'],
  },
  {
    id: '3', name: 'Diego Ríos', username: 'diego_rios',
    university: 'UTEC', career: 'Mecatrónica', specialty: 'Robótica e IoT',
    interests: ['Robótica', 'IoT', 'Hardware', 'Arduino'],
    goal: 'Emprender en automatización industrial',
    github: 'github.com/diego-rios',
    open_to: ['proyectos', 'mentoria'],
  },
  {
    id: '4', name: 'Sofía Ramírez', username: 'sofia_r',
    university: 'UNMSM', career: 'Estadística', specialty: 'Data Science',
    interests: ['R', 'Python', 'Econometría', 'Visualización'],
    goal: 'Analista de datos en sector público',
    linkedin: 'linkedin.com/in/sofia-r',
    open_to: ['mentoria', 'trabajo'],
  },
  {
    id: '5', name: 'Andrés Castillo', username: 'andres_c',
    university: 'UTEC', career: 'Bioingeniería', specialty: 'Imágenes médicas',
    interests: ['CV', 'Salud', 'Deep Learning', 'DICOM'],
    goal: 'Diagnóstico asistido por IA',
    github: 'github.com/andres-c',
    open_to: ['proyectos', 'investigacion' as 'proyectos'],
  },
  {
    id: '6', name: 'Lucía Vargas', username: 'lucia_v',
    university: 'USIL', career: 'Administración', specialty: 'Startups & Venture',
    interests: ['Emprendimiento', 'Fintech', 'GTM', 'Marketing'],
    goal: 'Fundar una startup edtech en Latam',
    linkedin: 'linkedin.com/in/lucia-v',
    open_to: ['proyectos', 'networking' as 'proyectos'],
  },
]

const UPCOMING_EVENTS = [
  { id: '1', title: 'Google Solution Challenge', date: '15 mar', type: 'Hackathon', org: 'GDG' },
  { id: '2', title: 'Tech Talks IEEE', date: '6 feb', type: 'Evento', org: 'IEEE UTEC' },
  { id: '3', title: 'Feria Laboral UTEC', date: '20 feb', type: 'Empleo', org: 'UTEC' },
]

// ── Modal Crear Publicación ────────────────────────────────────────────────

function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [content, setContent] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('networking')
  const [tags, setTags] = useState('')
  const [link, setLink] = useState('')
  const [showLink, setShowLink] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Nueva publicación</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Categoría */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {CATEGORIES.filter((c) => c.key !== 'todo').map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-medium transition-colors border',
                  selectedCategory === key
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Texto */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="¿Qué quieres compartir con la comunidad?"
            rows={5}
            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
          />

          {/* Link */}
          {showLink && (
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="mt-2"
            />
          )}

          {/* Tags */}
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Etiquetas separadas por coma (ej: Hackathon, IA, Lima)"
            className="mt-2"
          />

          {/* Acciones secundarias */}
          <div className="mt-3 flex items-center gap-1">
            <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ImageIcon className="size-3.5" /> Imagen
            </button>
            <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <FileText className="size-3.5" /> Documento
            </button>
            <button
              onClick={() => setShowLink((p) => !p)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LinkIcon className="size-3.5" /> Enlace
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4">
          <span className={cn('text-xs', content.length > 600 ? 'text-destructive' : 'text-muted-foreground')}>
            {content.length}/600
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" disabled={!content.trim()} className="gap-1.5">
              <Send className="size-3.5" /> Publicar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Componentes del Feed ───────────────────────────────────────────────────

function CategoryBadge({ category }: { category: Category }) {
  const cat = CATEGORIES.find((c) => c.key === category)
  if (!cat || category === 'todo') return null
  const Icon = cat.icon
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', CATEGORY_COLORS[category])}>
      <Icon className="size-3" />
      {cat.label}
    </span>
  )
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likes, setLikes] = useState(post.likes)
  const [expanded, setExpanded] = useState(false)
  const isLong = post.content.length > 180

  return (
    <article className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">{post.author.name}</span>
              {post.author.verified && (
                <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">✓</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {post.author.role ?? post.author.university} · {post.timeAgo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CategoryBadge category={post.category} />
          <button className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {post.title && <h3 className="mb-1.5 text-[15px] font-semibold leading-snug text-foreground">{post.title}</h3>}
      <p className={cn('text-sm leading-relaxed text-muted-foreground', !expanded && isLong && 'line-clamp-3')}>
        {post.content}
      </p>
      {isLong && (
        <button onClick={() => setExpanded((p) => !p)} className="mt-1 text-xs font-medium text-primary hover:underline">
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}

      {(post.deadline || post.location || post.link) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {post.deadline && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />{post.deadline}
            </span>
          )}
          {post.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />{post.location}
            </span>
          )}
          {post.link && (
            <a href={`https://${post.link}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="size-3" />{post.link}
            </a>
          )}
        </div>
      )}

      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span key={tag} className="cursor-pointer rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-1 border-t border-border/60 pt-3">
        <button
          onClick={() => { setLiked((p) => !p); setLikes((p) => (liked ? p - 1 : p + 1)) }}
          className={cn('flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
            liked ? 'text-rose-500 hover:bg-rose-500/8' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
        >
          <Heart className={cn('size-3.5', liked && 'fill-current')} />{likes}
        </button>
        <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <MessageCircle className="size-3.5" />{post.comments}
        </button>
        <button
          onClick={() => setSaved((p) => !p)}
          className={cn('flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
            saved ? 'text-primary hover:bg-primary/8' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
        >
          <Bookmark className={cn('size-3.5', saved && 'fill-current')} />{post.saves}
        </button>
        <div className="ml-auto">
          <button className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Share2 className="size-3.5" />Compartir
          </button>
        </div>
      </div>
    </article>
  )
}

// ── Componentes de Networking ──────────────────────────────────────────────

const OPEN_TO_LABELS: Record<string, string> = {
  mentoria: 'Mentoría',
  proyectos: 'Proyectos',
  trabajo: 'Trabajo',
}

function PersonCard({ person }: { person: Person }) {
  const [connected, setConnected] = useState(false)

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <Avatar src={person.avatar} name={person.name} size="md" />
        <Button
          variant={connected ? 'secondary' : 'outline'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setConnected((p) => !p)}
        >
          {connected ? 'Conectado ✓' : 'Conectar'}
        </Button>
      </div>

      <h3 className="text-sm font-semibold text-foreground">{person.name}</h3>
      <p className="text-xs text-muted-foreground">@{person.username}</p>

      <div className="mt-1.5 space-y-0.5">
        <p className="text-xs text-foreground">{person.career}{person.specialty ? ` · ${person.specialty}` : ''}</p>
        <p className="text-xs text-muted-foreground">{person.university}</p>
      </div>

      {person.goal && (
        <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">"{person.goal}"</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1">
        {person.interests.slice(0, 3).map((i) => (
          <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{i}</span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2">
          {person.github && (
            <a href={`https://${person.github}`} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground">
              <GitFork className="size-3.5" />
            </a>
          )}
          {person.linkedin && (
            <a href={`https://${person.linkedin}`} target="_blank" rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground">
              <Link2 className="size-3.5" />
            </a>
          )}
        </div>
        <div className="flex gap-1">
          {person.open_to.slice(0, 2).map((o) => (
            <span key={o} className="rounded-full bg-primary/8 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {OPEN_TO_LABELS[o]}
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
    <aside className="hidden w-72 shrink-0 xl:block">
      <FadeIn>
        <div className="sticky top-20 flex flex-col gap-5">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Próximos eventos</h3>
            <div className="flex flex-col divide-y divide-border/60">
              {UPCOMING_EVENTS.map((event) => (
                <div key={event.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/8 text-center">
                    <span className="text-[10px] font-bold leading-none text-primary">{event.date.split(' ')[0]}</span>
                    <span className="text-[9px] text-primary/70">{event.date.split(' ')[1] ?? ''}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{event.title}</p>
                    <p className="text-[11px] text-muted-foreground">{event.type} · {event.org}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Tendencias</h3>
            <div className="flex flex-col gap-2.5">
              {['IAGenerativa', 'GoogleSolutionChallenge', 'Fullbright2025', 'ReactNative', 'Investigacion'].map((tag) => (
                <button key={tag} className="flex items-center justify-between text-left group">
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">#{tag}</span>
                  <span className="text-[10px] text-muted-foreground/50">tendencia</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={onPublish}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Plus className="size-4" /> Compartir algo
          </button>
        </div>
      </FadeIn>
    </aside>
  )
}

// ── Página ─────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [activeCategory, setActiveCategory] = useState<Category>('todo')
  const [searchValue, setSearchValue] = useState('')
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [networkingSearch, setNetworkingSearch] = useState('')

  const filteredPosts = MOCK_POSTS.filter((p) => {
    const matchCat = activeCategory === 'todo' || p.category === activeCategory
    const matchSearch = !searchValue ||
      p.content.toLowerCase().includes(searchValue.toLowerCase()) ||
      (p.title?.toLowerCase().includes(searchValue.toLowerCase()) ?? false) ||
      p.tags.some((t) => t.toLowerCase().includes(searchValue.toLowerCase()))
    return matchCat && matchSearch
  })

  const filteredPeople = MOCK_PEOPLE.filter((p) =>
    !networkingSearch ||
    p.name.toLowerCase().includes(networkingSearch.toLowerCase()) ||
    p.career.toLowerCase().includes(networkingSearch.toLowerCase()) ||
    p.university.toLowerCase().includes(networkingSearch.toLowerCase()) ||
    p.interests.some((i) => i.toLowerCase().includes(networkingSearch.toLowerCase()))
  )

  return (
    <div className="mx-auto max-w-6xl">
      <AnimatePresence>
        {showCreatePost && <CreatePostModal onClose={() => setShowCreatePost(false)} />}
      </AnimatePresence>

      {/* Header */}
      <FadeIn>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Comunidad</h1>
            <p className="text-sm text-muted-foreground">
              Oportunidades, eventos y personas del ecosistema educativo y tecnológico.
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={() => setShowCreatePost(true)}>
            <Plus className="size-4" />Publicar
          </Button>
        </div>
      </FadeIn>

      {/* Tabs principales */}
      <FadeIn>
        <div className="mb-5 flex gap-0 border-b border-border">
          {([{ key: 'feed', label: 'Feed' }, { key: 'networking', label: 'Networking' }] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                activeTab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FadeIn>

      <AnimatePresence mode="wait">
        {activeTab === 'feed' ? (
          <motion.div key="feed" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="flex gap-6">
            {/* Feed */}
            <div className="min-w-0 flex-1">
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search" placeholder="Buscar publicaciones, eventos, oportunidades..."
                  value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
                />
              </div>

              <div className="mb-4 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                {CATEGORIES.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      activeCategory === key
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="size-3" />{label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeCategory + searchValue} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
                        <Search className="size-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Sin resultados</p>
                      <p className="text-xs text-muted-foreground">Intenta con otro filtro o búsqueda</p>
                    </div>
                  ) : (
                    <Stagger className="flex flex-col gap-3">
                      {filteredPosts.map((post) => (
                        <StaggerItem key={post.id}><PostCard post={post} /></StaggerItem>
                      ))}
                    </Stagger>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <RightPanel onPublish={() => setShowCreatePost(true)} />
          </motion.div>
        ) : (
          <motion.div key="networking" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className="mb-5">
              <h2 className="mb-1 text-base font-semibold text-foreground">Descubre personas</h2>
              <p className="mb-4 text-sm text-muted-foreground">Estudiantes, investigadores y profesionales con intereses similares.</p>
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search" placeholder="Buscar por nombre, carrera o interés..."
                  value={networkingSearch} onChange={(e) => setNetworkingSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
                />
              </div>
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
