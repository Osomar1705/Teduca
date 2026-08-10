'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }
    apiClient
      .post('/api/v1/auth/verify-email', { token })
      .then(() => {
        setStatus('success')
        setTimeout(() => router.push('/dashboard'), 3000)
      })
      .catch(() => setStatus('error'))
  }, [token, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 size-10 animate-spin text-primary" />
            <h1 className="text-lg font-bold text-foreground">Verificando tu correo…</h1>
            <p className="mt-2 text-sm text-muted-foreground">Un momento por favor.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 size-10 text-emerald-500" />
            <h1 className="text-lg font-bold text-foreground">¡Correo verificado!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu cuenta está confirmada. Te redirigimos al dashboard…
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-4 size-10 text-destructive" />
            <h1 className="text-lg font-bold text-foreground">Enlace inválido o expirado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              El enlace de verificación ya fue usado o expiró (24 horas).
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ir al login
            </button>
          </>
        )}
        {status === 'no-token' && (
          <>
            <Mail className="mx-auto mb-4 size-10 text-muted-foreground" />
            <h1 className="text-lg font-bold text-foreground">Verifica tu correo</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Revisa tu bandeja de entrada y haz clic en el enlace que te enviamos al registrarte.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ir al login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
