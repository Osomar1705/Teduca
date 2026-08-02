'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { APP_ROUTES } from '@/lib/constants'
import { getOnboardingStatus } from '@/lib/onboarding/service'

const GSI_SRC = 'https://accounts.google.com/gsi/client'

interface GoogleCredentialResponse {
  credential: string
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string
        callback: (res: GoogleCredentialResponse) => void
      }) => void
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

/** Carga el script de Google Identity Services una sola vez. */
function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return
    if (window.google?.accounts?.id) return resolve()
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`
    )
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('GSI load error')))
      return
    }
    const script = document.createElement('script')
    script.src = GSI_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('GSI load error'))
    document.head.appendChild(script)
  })
}

/**
 * Botón "Continuar con Google".
 *
 * Es 100% opcional: consulta al backend (`/auth/config`) si Google está
 * habilitado. Si no lo está (interruptor apagado o sin credenciales), no
 * renderiza nada y la app sigue funcionando igual con el login por email.
 */
export function GoogleSignInButton({
  onError,
}: {
  onError?: (message: string) => void
}) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    authClient.getConfig().then((config) => {
      if (!active) return
      if (config.google_enabled && config.google_client_id) {
        setClientId(config.google_client_id)
        setEnabled(true)
      }
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!enabled || !clientId || !containerRef.current) return
    let cancelled = false

    loadGsiScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (res) => {
            const { error } = await authClient.signInWithGoogle(res.credential)
            if (error) {
              onError?.(error.message ?? 'No se pudo iniciar sesión con Google.')
              return
            }
            const onboarding = await getOnboardingStatus().catch(() => null)
            const dest = onboarding?.completed ? APP_ROUTES.DASHBOARD : APP_ROUTES.ONBOARDING
            router.push(dest)
            router.refresh()
          },
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 320,
          locale: 'es',
        })
      })
      .catch(() => {
        onError?.('No se pudo cargar Google. Intentá con tu email.')
      })

    return () => {
      cancelled = true
    }
  }, [enabled, clientId, onError, router])

  if (!enabled) return null

  return (
    <div className="mt-4">
      <div className="relative mb-4 flex items-center">
        <div className="grow border-t border-border" />
        <span className="mx-3 text-xs text-muted-foreground">o</span>
        <div className="grow border-t border-border" />
      </div>
      <div ref={containerRef} className="flex justify-center" />
    </div>
  )
}
