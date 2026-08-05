'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, GraduationCap, Users } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/common/Motion'
import { API_BASE_URL } from '@/lib/api-client'

interface PublicProfile {
  username: string
  full_name: string
  avatar: string | null
  institution: string | null
  career: string | null
  academic_year: string | null
  subject_tags: string[]
  goals: string[]
}

async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/users/profile/${username}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const [profile, setProfile] = useState<PublicProfile | null | undefined>(undefined)

  useEffect(() => {
    fetchPublicProfile(username).then(setProfile)
  }, [username])

  if (profile === undefined) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

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
            <div className="h-40 w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
            <div className="absolute -bottom-10 left-6">
              <Avatar src={profile.avatar ?? undefined} name={profile.full_name} size="xl" className="ring-4 ring-background" />
            </div>
          </div>

          <div className="mt-14 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
              <Button asChild variant="brand" className="shrink-0">
                <Link href="/register">Conectar</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {profile.institution && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="size-3.5" />{profile.institution}
                </span>
              )}
              {profile.career && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <GraduationCap className="size-3.5" />{profile.career}
                  {profile.academic_year ? ` · ${profile.academic_year}` : ''}
                </span>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {profile.subject_tags.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h2 className="mb-3 text-sm font-semibold text-foreground">Áreas de estudio</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.subject_tags.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.goals.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h2 className="mb-3 text-sm font-semibold text-foreground">Objetivos</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.goals.map((g) => (
                      <Badge key={g} variant="outline" className="text-xs">{g}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5 text-center">
              <p className="mb-1 text-sm font-medium text-foreground">¿Querés conectar con {profile.full_name}?</p>
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
