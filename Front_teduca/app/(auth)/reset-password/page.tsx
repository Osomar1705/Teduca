'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(!token ? 'Enlace inválido o expirado.' : '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setError('')
    try {
      await apiClient.post('/api/v1/auth/reset-password', { token, new_password: password })
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setError((err as Error).message || 'El enlace es inválido o ya expiró.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.85rem', borderRadius: 6,
    border: '1px solid #333', background: '#0a0a0a', color: '#fff',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000', color: '#fff',
      fontFamily: "'Inter',-apple-system,sans-serif",
    }}>
      <div style={{
        background: '#111', borderRadius: 14, padding: '2rem',
        width: '100%', maxWidth: 400, margin: '0 1rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
        border: '1px solid #222',
      }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Nueva contraseña
        </h1>

        {done ? (
          <>
            <p style={{ color: '#4ade80', fontSize: '0.875rem', lineHeight: 1.6 }}>
              ¡Contraseña restablecida! Serás redirigido al inicio de sesión en segundos...
            </p>
            <Link href="/login" style={{ display: 'block', marginTop: '1rem', color: '#ededed', fontSize: '0.875rem' }}>
              Ir al inicio de sesión →
            </Link>
          </>
        ) : (
          <>
            <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Ingresá tu nueva contraseña (mínimo 8 caracteres).
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  style={{ ...inputStyle, paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={{
                    position: 'absolute', top: '50%', right: '0.75rem',
                    transform: 'translateY(-50%)', background: 'none', border: 'none',
                    cursor: 'pointer', color: '#666', padding: 0, display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p style={{ fontSize: '0.8rem', color: '#f87171' }} role="alert">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !token}
                style={{
                  width: '100%', padding: '0.65rem', borderRadius: 6, border: 'none',
                  background: loading || !token ? '#555' : '#ededed', color: '#000',
                  fontWeight: 600, fontSize: '0.875rem',
                  cursor: loading || !token ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
