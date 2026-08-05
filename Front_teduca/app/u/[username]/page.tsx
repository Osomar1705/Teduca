'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  GitFork, Link2, Globe, Building2, GraduationCap,
  MapPin, Users, FlaskConical, Briefcase, ArrowLeft,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/common/Motion'

// Perfil público mock — en producción se consulta la API por username
const MOCK_PUBLIC_PROFILES: Record<string, {
  name: string; username: string; avatar?: string; coverUrl?: string;
  bio?: string; institution?: string; career?: string; specialty?: string;
  location?: string; skills: string[]; interests: string[];
  github?: string; linkedin?: string; portfolio?: string;
  openToMentoring: boolean; openToProjects: boolean; openToWork: boolean;
}> = {
  osmar: {
    name: 'Osmar Vilchez',
    username: 'osmar',
    bio: 'Desarrollando el futuro de la educación en Latinoamérica.',
    institution: 'UTEC',
    career: 'Ingeniería de Software',
    specialty: 'Fullstack & EdTech',
    location: 'Lima, Perú',
    skills: ['TypeScript', 'Python', 'FastAPI', 'Next.js', 'PostgreSQL'],
    interests: ['EdTech', 'Startups', 'IA', 'Diseño de producto'],
    github: 'osmar',
    linkedin: 'osmar-vilchez',
    openToMentoring: true,
    openToProjects: true,
    openToWork: false,
  },
}

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const profile = MOCK_PUBLIC_PROFILES[username.toLowerCase()]

  if (!profile) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background p-8 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
          <Users className="size-7 text-muted-foreground" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground">Perfil no encontrado</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          No existe ningún usuario con el nombre <span className="font-medium">@{username}</span>.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Topbar minimal */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="text-lg font-bold tracking-tight text-primary">TEDUCA</span>
          </Link>
          <Button size="sm" asChild variant="outline">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <FadeIn>
          {/* Cover */}
          <div className="relative mb-4">
            <div className="h-40 w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
              {profile.coverUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.coverUrl} alt="Portada" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="absolute -bottom-10 left-6">
              <Avatar src={profile.avatar} name={profile.name} size="xl" className="ring-4 ring-background" />
            </div>
          </div>

          {/* Info principal */}
          <div className="mt-14 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
                {profile.bio && (
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
                )}
              </div>
              <Button className="shrink-0">Conectar</Button>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {profile.institution && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="size-3.5" />{profile.institution}
                </span>
              )}
              {profile.career && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <GraduationCap className="size-3.5" />{profile.career}{profile.specialty ? ` · ${profile.specialty}` : ''}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />{profile.location}
                </span>
              )}
            </div>

            {/* Disponibilidad */}
            <div className="flex flex-wrap gap-2">
              {profile.openToMentoring && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Users className="size-3" /> Disponible para mentoría
                </span>
              )}
              {profile.openToProjects && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <FlaskConical className="size-3" /> Abierto a proyectos
                </span>
              )}
              {profile.openToWork && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Briefcase className="size-3" /> Buscando trabajo
                </span>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {profile.skills.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h2 className="mb-3 text-sm font-semibold text-foreground">Habilidades</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {profile.interests.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h2 className="mb-3 text-sm font-semibold text-foreground">Intereses</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((i) => (
                      <Badge key={i} variant="outline" className="text-xs">{i}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Redes */}
            <div className="flex items-center gap-4 border-t border-border pt-5">
              {profile.github && (
                <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <GitFork className="size-4" /> {profile.github}
                </a>
              )}
              {profile.linkedin && (
                <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Link2 className="size-4" /> LinkedIn
                </a>
              )}
              {profile.portfolio && (
                <a href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Globe className="size-4" /> Portafolio
                </a>
              )}
            </div>

            {/* CTA para no autenticados */}
            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="mb-1 text-sm font-medium text-foreground">¿Quieres conectar con {profile.name}?</p>
              <p className="mb-4 text-xs text-muted-foreground">Únete a TEDUCA para conectar, colaborar y crecer juntos.</p>
              <div className="flex justify-center gap-3">
                <Button asChild variant="brand">
                  <Link href="/register">Crear cuenta gratis</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </main>
    </div>
  )
}
