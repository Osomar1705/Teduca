'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ShieldCheck, UserCheck, UserX, Clock, CheckCircle2,
  XCircle, Mail, Users, AlertTriangle,
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/constants'
import { FadeIn, Stagger, StaggerItem } from '@/components/common/Motion'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface AdminUser {
  id: string
  email: string
  name: string
  avatar: string | null
  is_active: boolean
  email_verified: boolean
  roles: { id: string; name: string }[]
  created_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  variant,
  loading,
}: {
  label: string
  icon: React.ElementType
  onClick: () => void
  variant: 'approve' | 'reject'
  loading: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={[
        'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50',
        variant === 'approve'
          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
          : 'bg-destructive/10 text-destructive hover:bg-destructive/20',
      ].join(' ')}
    >
      <Icon className="size-3.5" />
      {loading ? '…' : label}
    </button>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [pending, setPending] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState<Record<string, 'approved' | 'rejected'>>({})

  useEffect(() => {
    apiClient
      .get<AdminUser[]>('/api/v1/users/admin/pending-teachers')
      .then(setPending)
      .catch((e: Error) => {
        if (e.message.toLowerCase().includes('rol') || e.message.includes('403')) {
          setForbidden(true)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleApprove(user: AdminUser) {
    setActionLoading((prev) => ({ ...prev, [user.id]: true }))
    try {
      await apiClient.post(`/api/v1/users/${user.id}/approve-teacher`)
      setDone((prev) => ({ ...prev, [user.id]: 'approved' }))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al aprobar')
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: false }))
    }
  }

  async function handleReject(user: AdminUser) {
    if (!confirm(`¿Rechazar la solicitud de ${user.name}? Volverá a ser Estudiante.`)) return
    setActionLoading((prev) => ({ ...prev, [user.id]: true }))
    try {
      await apiClient.post(`/api/v1/users/${user.id}/revoke-teacher`)
      setDone((prev) => ({ ...prev, [user.id]: 'rejected' }))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Error al rechazar')
    } finally {
      setActionLoading((prev) => ({ ...prev, [user.id]: false }))
    }
  }

  if (forbidden) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="mb-3 size-10 text-destructive/60" />
        <p className="font-semibold text-foreground">Acceso restringido</p>
        <p className="mt-1 text-sm text-muted-foreground">Esta sección es solo para administradores.</p>
      </div>
    )
  }

  const activePending = pending.filter((u) => !done[u.id])
  const processed = pending.filter((u) => done[u.id])

  return (
    <div className="mx-auto max-w-4xl">
      <FadeIn>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-sm text-muted-foreground">Gestión de solicitudes de Profesor</p>
          </div>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn>
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { icon: Clock, label: 'Pendientes', value: activePending.length, color: 'text-amber-500' },
            { icon: CheckCircle2, label: 'Aprobados hoy', value: processed.filter((u) => done[u.id] === 'approved').length, color: 'text-emerald-500' },
            { icon: XCircle, label: 'Rechazados hoy', value: processed.filter((u) => done[u.id] === 'rejected').length, color: 'text-destructive' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <s.icon className={`mb-1.5 size-5 ${s.color}`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Lista pendientes */}
      <FadeIn>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Solicitudes pendientes de aprobación
        </h2>
      </FadeIn>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="size-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : activePending.length === 0 ? (
        <FadeIn>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
            <Users className="mb-3 size-10 text-muted-foreground/40" />
            <p className="font-medium text-foreground">Sin solicitudes pendientes</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando alguien solicite ser Profesor aparecerá aquí.
            </p>
          </div>
        </FadeIn>
      ) : (
        <Stagger className="flex flex-col gap-3">
          {activePending.map((user) => (
            <StaggerItem key={user.id}>
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                <Avatar src={user.avatar} name={user.name} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground">{user.name}</p>
                    {!user.email_verified && (
                      <Badge variant="warning" className="text-[10px]">Email no verificado</Badge>
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="size-3" /> {user.email}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Solicitud: {formatDate(user.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ActionButton
                    label="Aprobar"
                    icon={UserCheck}
                    onClick={() => handleApprove(user)}
                    variant="approve"
                    loading={!!actionLoading[user.id]}
                  />
                  <ActionButton
                    label="Rechazar"
                    icon={UserX}
                    onClick={() => handleReject(user)}
                    variant="reject"
                    loading={!!actionLoading[user.id]}
                  />
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Procesados en esta sesión */}
      {processed.length > 0 && (
        <FadeIn>
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              Procesados en esta sesión
            </h2>
            <div className="flex flex-col gap-2">
              {processed.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 opacity-60"
                >
                  <Avatar src={user.avatar} name={user.name} size="sm" />
                  <p className="flex-1 text-sm font-medium text-foreground">{user.name}</p>
                  {done[user.id] === 'approved' ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" /> Aprobado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-destructive">
                      <XCircle className="size-3.5" /> Rechazado
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  )
}
