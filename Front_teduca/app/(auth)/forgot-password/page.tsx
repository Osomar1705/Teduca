'use client'

import { useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await apiClient.post('/api/v1/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setError('Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
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
          Olvidé mi contraseña
        </h1>

        {sent ? (
          <>
            <p style={{ color: '#888', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Si el email existe en TEDUCA, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            <Link href="/login" style={{ display: 'block', marginTop: '1.5rem', color: '#ededed', fontSize: '0.875rem' }}>
              ← Volver al inicio de sesión
            </Link>
          </>
        ) : (
          <>
            <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Ingresá tu email y te enviamos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: '100%', padding: '0.65rem 0.85rem', borderRadius: 6,
                  border: '1px solid #333', background: '#0a0a0a', color: '#fff',
                  fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
                }}
              />
              {error && (
                <p style={{ fontSize: '0.8rem', color: '#f87171' }} role="alert">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '0.65rem', borderRadius: 6, border: 'none',
                  background: loading ? '#555' : '#ededed', color: '#000',
                  fontWeight: 600, fontSize: '0.875rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
            <Link href="/login" style={{ display: 'block', marginTop: '1rem', color: '#666', fontSize: '0.8rem', textAlign: 'center' }}>
              ← Volver al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
