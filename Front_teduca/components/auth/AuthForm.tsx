'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { APP_ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/common/Logo'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name })
      : await authClient.signIn.email({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message ?? 'Ocurrió un error. Intentá de nuevo.')
      return
    }

    router.push(APP_ROUTES.DASHBOARD)
    router.refresh()
  }

  return (
    <Card className="w-full p-6 shadow-lg sm:p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo className="mb-5 h-11 w-auto" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {isSignUp ? 'Creá tu cuenta' : 'Bienvenido de nuevo'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSignUp
            ? 'Registrate para empezar a aprender'
            : 'Iniciá sesión para continuar'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isSignUp && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
              placeholder="Tu nombre"
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="tu@email.com"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignUp ? 8 : undefined}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {isSignUp && (
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres, con mayúsculas, minúsculas y números.
            </p>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="brand"
          disabled={loading}
          className="mt-1 w-full"
        >
          {loading
            ? 'Procesando...'
            : isSignUp
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta? '}
        <Link
          href={isSignUp ? APP_ROUTES.LOGIN : APP_ROUTES.REGISTER}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isSignUp ? 'Iniciar sesión' : 'Crear cuenta'}
        </Link>
      </p>
    </Card>
  )
}
