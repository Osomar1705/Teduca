'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Heart, MessageCircle, Bookmark, Share2,
  MoreHorizontal, MapPin, ExternalLink, Calendar, Users,
  Zap, BookOpen, Briefcase, Globe, Award, Lightbulb, Rocket,
  X, Link as LinkIcon, Send, GitFork, Link2, Loader2,
  UserPlus, CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { ImageUploader, type PostImage } from '@/components/community/ImageUploader'
import { fetchPosts, createPost, toggleLike, toggleSave, type ApiPost } from '@/lib/community/service'

// ── Tipos ──────────────────────────────────────────────────────────────────

type Tab = 'feed' | 'para-ti' | 'networking'

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

const FEED_TRENDS = [
  { key: 'hackathons',    label: 'Hackathons'    },
  { key: 'becas',         label: 'Becas'         },
  { key: 'trabajo',       label: 'Trabajo'       },
  { key: 'cursos',        label: 'Cursos'        },
  { key: 'investigacion', label: 'Investigacion' },
  { key: 'eventos',       label: 'Eventos'       },
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

// ── Mock data eliminado — las secciones de videos, personas y eventos
// muestran estado vacío hasta que el backend implemente esos endpoints.

// Tendencias, grupos y empresas: pendiente de endpoint — se muestran vacíos.

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
      const apiPost = await createPost({ content, category, title: title.trim() || undefined, link: link.trim() || undefined, tags, image_urls })
      onPublish(apiToPost(apiPost))
      onClose()
    } catch {
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
        role="dialog" aria-modal="true" aria-labelledby="new-post-title"
        className="relative z-10 flex w-full max-w-xl flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-3.5">
          <h2 id="new-post-title" className="text-sm font-semibold text-foreground">Nueva publicación</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-xl p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto">
          <div className="space-y-4 p-5">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Categoría</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.filter((c) => c.key !== 'todo').map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button" onClick={() => setCategory(key)}
                    className={cn('flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                      category === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground')}>
                    <Icon className="size-3" />{label}
                  </button>
                ))}
              </div>
            </div>

            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional)" className="font-medium" />

            <div className="relative">
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="¿Qué querés compartir con la comunidad?" rows={4}
                className="w-full resize-none rounded-2xl border border-input bg-background/95 px-4 py-3 text-sm leading-relaxed shadow-xs outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-ring focus:ring-3 focus:ring-ring/20" />
              <span className={cn('absolute bottom-2.5 right-3 text-[10px]', remaining < 60 ? 'text-destructive' : 'text-muted-foreground/50')}>{remaining}</span>
            </div>

            <ImageUploader onChange={setPostImages} maxImages={4} maxSizeMb={10} />

            {showLink && (
              <div className="flex items-center gap-2">
                <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://youtube.com/watch?v=... o enlace externo" />
              </div>
            )}

            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Etiquetas separadas por coma: Hackathon, IA, Lima" />
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/60 bg-muted/[0.02] px-5 py-3.5">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setShowLink((p) => !p)} aria-pressed={showLink}
              className={cn('flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors',
                showLink ? 'text-primary bg-primary/8' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              <LinkIcon className="size-3.5" /> Video / Enlace
            </button>
            {isUploading && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" /> Subiendo…</span>}
            {hasError && !isUploading && <span className="text-xs text-destructive">Algunas imágenes fallaron</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" disabled={!canPublish} onClick={handlePublish} className="gap-1.5">
              {isUploading || publishing
                ? <><Loader2 className="size-3.5 animate-spin" />{isUploading ? 'Subiendo…' : 'Publicando…'}</>
                : <><Send className="size-3.5" /> Publicar</>}
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

// ── Helpers de video ───────────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('?')[0]
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v')
    return null
  } catch { return null }
}

function VideoEmbed({ link }: { link: string }) {
  const ytId = getYouTubeId(link)
  if (ytId) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ytId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
        />
      </div>
    )
  }
  return null
}

// ── PostCard ───────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likes, setLikes] = useState(post.likes)
  const [saves, setSaves] = useState(post.saves)
  const [expanded, setExp] = useState(false)
  const isLong = post.content.length > 200

  async function handleLike() {
    setLiked((p) => !p)
    setLikes((p) => liked ? p - 1 : p + 1)
    try { const res = await toggleLike(post.id); setLiked(res.liked); setLikes(res.likes_count) } catch {}
  }

  async function handleSave() {
    setSaved((p) => !p)
    setSaves((p) => saved ? p - 1 : p + 1)
    try { const res = await toggleSave(post.id); setSaved(res.saved); setSaves(res.saves_count) } catch {}
  }

  const isVideoLink = post.link ? !!getYouTubeId(post.link) : false

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-200 hover:border-border/80 hover:shadow-md">
      {post.link && isVideoLink && <div className="p-4 pb-0"><VideoEmbed link={post.link} /></div>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {post.image && !isVideoLink && <img src={post.image} alt="" className="aspect-video w-full object-cover" />}
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar src={post.author.avatar} name={post.author.name} size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium leading-none text-foreground">{post.author.name}</span>
                {post.author.verified && <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">✓</span>}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{post.author.role} · {post.timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CategoryBadge category={post.category} />
            <button className="rounded-xl p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"><MoreHorizontal className="size-4" /></button>
          </div>
        </div>

        {post.title && <h3 className="mb-1.5 text-[15px] font-semibold leading-snug text-foreground">{post.title}</h3>}
        <p className={cn('text-sm leading-relaxed text-muted-foreground', !expanded && isLong && 'line-clamp-3')}>{post.content}</p>
        {isLong && <button onClick={() => setExp((p) => !p)} className="mt-1 text-xs font-medium text-primary hover:underline">{expanded ? 'Ver menos' : 'Ver más'}</button>}

        {(post.deadline || post.location || (post.link && !isVideoLink)) && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl bg-muted/50 px-3 py-2">
            {post.deadline && <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="size-3" />{post.deadline}</span>}
            {post.location && <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3" />{post.location}</span>}
            {post.link && !isVideoLink && <a href={`https://${post.link}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline"><ExternalLink className="size-3" />{post.link}</a>}
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span key={tag} className="cursor-pointer rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground">#{tag}</span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-0.5 border-t border-border/60 pt-3">
          <button onClick={handleLike} className={cn('flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors', liked ? 'text-rose-500 hover:bg-rose-500/8' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
            <Heart className={cn('size-3.5', liked && 'fill-current')} />{likes}
          </button>
          <button className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <MessageCircle className="size-3.5" />{post.comments}
          </button>
          <button onClick={handleSave} className={cn('flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors', saved ? 'text-primary hover:bg-primary/8' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
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
        <Button variant={connected ? 'secondary' : 'outline'} size="sm" className="h-7 shrink-0 text-xs gap-1" onClick={() => setConnected((p) => !p)}>
          {connected ? <><CheckCircle2 className="size-3" />Conectado</> : <><UserPlus className="size-3" />Conectar</>}
        </Button>
      </div>
      <p className="text-sm font-semibold text-foreground leading-tight">{person.name}</p>
      <p className="text-xs text-muted-foreground">@{person.username}</p>
      <div className="mt-1.5 space-y-0.5">
        <p className="text-xs text-foreground">{person.career}{person.specialty ? ` · ${person.specialty}` : ''}</p>
        <p className="text-xs text-muted-foreground">{person.university}</p>
      </div>
      {person.goal && <p className="mt-2 line-clamp-2 text-xs italic text-muted-foreground">&ldquo;{person.goal}&rdquo;</p>}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {person.interests.slice(0, 3).map((i) => (
          <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{i}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2.5">
          {person.github && <a href={`https://github.com/${person.github}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><GitFork className="size-3.5" /></a>}
          {person.linkedin && <a href={`https://linkedin.com/in/${person.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors"><Link2 className="size-3.5" /></a>}
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          {person.open_to.slice(0, 2).map((o) => (
            <span key={o} className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', OPEN_TO_STYLE[o])}>{OPEN_TO_LABEL[o]}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── RightPanel ─────────────────────────────────────────────────────────────

function RightPanel({ onPublish }: { onPublish: () => void }) {
  return (
    <aside className="hidden w-64 shrink-0 xl:block">
      <div className="sticky top-20 flex flex-col gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Próximos eventos</p>
          <p className="text-xs text-muted-foreground">Próximamente disponible.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tendencias</p>
          <p className="text-xs text-muted-foreground">Próximamente disponible.</p>
        </div>

        <button onClick={onPublish} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
          <Plus className="size-3.5" /> Compartir algo
        </button>
      </div>
    </aside>
  )
}

// ── apiToPost ──────────────────────────────────────────────────────────────

function apiToPost(a: ApiPost): Post {
  return {
    id: a.id,
    author: { name: a.author.name, username: a.author.id, avatar: a.author.avatar ?? undefined, role: undefined, verified: false },
    category: (a.category as Category) ?? 'todo',
    title: a.title ?? undefined,
    content: a.content,
    tags: a.tags,
    location: a.location ?? undefined,
    deadline: a.deadline ?? undefined,
    link: a.link ?? undefined,
    image: a.image_urls[0] ?? undefined,
    likes: a.likes_count,
    comments: a.comments_count,
    saves: a.saves_count,
    timeAgo: new Date(a.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }),
  }
}

// ── Página principal ───────────────────────────────────────────────────────

const COMMUNITY_TABS: { key: Tab; label: string }[] = [
  { key: 'feed',       label: 'Feed'       },
  { key: 'para-ti',    label: 'Para Ti'    },
  { key: 'networking', label: 'Networking' },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab]           = useState<Tab>('feed')
  const [activeCategory, setActiveCategory] = useState<Category>('todo')
  const [search, setSearch]                 = useState('')
  const [netSearch, setNetSearch]           = useState('')
  const [showModal, setShowModal]           = useState(false)
  const [posts, setPosts]                   = useState<Post[]>([])
  const [loadingPosts, setLoadingPosts]     = useState(true)
  const didFetch                            = useRef(false)

  const loadPosts = useCallback(async (category: Category, q: string) => {
    setLoadingPosts(true)
    try {
      const feed = await fetchPosts({ category, search: q || undefined, page_size: 50 })
      setPosts(feed.items.map(apiToPost))
    } catch {
      setPosts([])
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

  const filteredPosts  = posts
  const filteredPeople: Person[] = []

  return (
    <div className="mx-auto max-w-6xl">
      <AnimatePresence>
        {showModal && <CreatePostModal onClose={() => setShowModal(false)} onPublish={(p) => setPosts((prev) => [p, ...prev])} />}
      </AnimatePresence>

      {/* Header */}
      <FadeIn>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[1.9rem] font-bold tracking-tight text-foreground">Comunidad</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Oportunidades, eventos y personas del ecosistema educativo.</p>
          </div>
          <Button size="sm" onClick={() => setShowModal(true)} className="gap-1.5 shrink-0">
            <Plus className="size-4" /> Publicar
          </Button>
        </div>
      </FadeIn>

      {/* Tabs — pill style con indicador animado */}
      <FadeIn>
        <div className="mb-5 relative inline-flex w-full gap-0.5 rounded-2xl border border-border bg-muted/30 p-1">
          {COMMUNITY_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              aria-pressed={activeTab === t.key}
              className="relative flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-150 z-10"
            >
              {activeTab === t.key && (
                <motion.span
                  layoutId="community-tab-bg"
                  className="absolute inset-0 rounded-xl bg-background shadow-xs"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span className={cn('relative', activeTab === t.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </FadeIn>

      {/* Contenido */}
      <AnimatePresence mode="wait">

        {/* ── FEED ── */}
        {activeTab === 'feed' && (
          <motion.div key="feed" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex gap-6">
            <div className="min-w-0 flex-1 space-y-4">

              {/* Quick trends chips */}
              <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                {FEED_TRENDS.map((t) => (
                  <button key={t.key} onClick={() => setActiveCategory(t.key as Category)} aria-pressed={activeCategory === t.key}
                    className={cn('flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                      activeCategory === t.key ? 'border-primary bg-primary text-primary-foreground shadow-xs' : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground')}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Buscador */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar publicaciones, eventos, oportunidades..."
                  className="h-10 w-full rounded-xl border border-input bg-background/95 pl-9 pr-4 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-ring focus:ring-3 focus:ring-ring/20" />
              </div>

              {/* Filtros categorías */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
                {CATEGORIES.map(({ key, label, icon: Icon }) => (
                  <button key={key} type="button" onClick={() => setActiveCategory(key)} aria-pressed={activeCategory === key}
                    className={cn('flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                      activeCategory === key ? 'border-primary bg-primary text-primary-foreground shadow-xs' : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted hover:text-foreground')}>
                    <Icon className="size-3" />{label}
                  </button>
                ))}
              </div>

              {/* Posts */}
              <AnimatePresence mode="wait">
                <motion.div key={activeCategory + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  {loadingPosts ? (
                    <div className="flex items-center justify-center py-20"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted"><Search className="size-5 text-muted-foreground" /></div>
                      <p className="text-sm font-medium text-foreground">Sin resultados</p>
                      <p className="text-xs text-muted-foreground">Prueba con otro filtro o sé el primero en publicar</p>
                    </div>
                  ) : (
                    <Stagger className="flex flex-col gap-3">
                      {filteredPosts.map((post) => (<StaggerItem key={post.id}><PostCard post={post} /></StaggerItem>))}
                    </Stagger>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <RightPanel onPublish={() => setShowModal(true)} />
          </motion.div>
        )}

        {/* ── PARA TI ── */}
        {activeTab === 'para-ti' && (
          <motion.div key="para-ti" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-6">


            {/* Descubrir profesores */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Profesores recomendados</h2>
                <Link href="/discover" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">Ver más <ArrowRight className="size-3" /></Link>
              </div>
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm font-medium">Aún no hay recomendaciones personalizadas</p>
                <p className="mt-1 text-xs">Cuando interactúes más, aparecerán aquí.</p>
              </div>
            </section>

            {/* Oportunidades recientes */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">Oportunidades para ti</h2>
                <button onClick={() => setActiveTab('feed')} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">Ver feed <ArrowRight className="size-3" /></button>
              </div>
              <div className="flex flex-col gap-3">
                {filteredPosts.slice(0, 3).map((post) => (<PostCard key={post.id} post={post} />))}
              </div>
            </section>
          </motion.div>
        )}

        {/* ── NETWORKING ── */}
        {activeTab === 'networking' && (
          <motion.div key="networking" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-8">

            {/* Buscador */}
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" value={netSearch} onChange={(e) => setNetSearch(e.target.value)} placeholder="Buscar por nombre, carrera o interés..."
                className="h-10 w-full rounded-xl border border-input bg-background/95 pl-9 pr-4 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-ring focus:ring-3 focus:ring-ring/20" />
            </div>

            {/* Personas que quizá conozcas */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Personas que quizá conozcas</h2>
                  <p className="text-xs text-muted-foreground">Estudiantes e investigadores con intereses similares.</p>
                </div>
              </div>
              {filteredPeople.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted"><Users className="size-5 text-muted-foreground" /></div>
                  <p className="text-sm font-medium text-foreground">Sin resultados</p>
                  <p className="text-xs text-muted-foreground">Prueba con otro término</p>
                </div>
              ) : (
                <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPeople.map((person) => (<StaggerItem key={person.id}><PersonCard person={person} /></StaggerItem>))}
                </Stagger>
              )}
            </section>

            {/* Empresas buscando estudiantes */}
            <section>
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-foreground">Empresas buscando estudiantes</h2>
                <p className="text-xs text-muted-foreground">Oportunidades de prácticas y empleo destacadas.</p>
              </div>
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm font-medium">Aún no hay oportunidades disponibles</p>
                <p className="mt-1 text-xs">Cuando haya contenido nuevo aparecerá aquí.</p>
              </div>
            </section>

            {/* Grupos y comunidades */}
            <section>
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-foreground">Grupos y comunidades</h2>
                <p className="text-xs text-muted-foreground">Clubes, laboratorios y comunidades técnicas.</p>
              </div>
              <div className="py-8 text-center text-muted-foreground">
                <p className="text-sm font-medium">Aún no hay grupos disponibles</p>
                <p className="mt-1 text-xs">Cuando haya contenido nuevo aparecerá aquí.</p>
              </div>
            </section>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
