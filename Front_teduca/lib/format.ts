import type { Modality } from './edtech/types'

export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.round(diff / 1000)
  if (sec < 60) return 'hace un momento'
  const min = Math.round(sec / 60)
  if (min < 60) return `hace ${min} min`
  const hr = Math.round(min / 60)
  if (hr < 24) return `hace ${hr} h`
  const days = Math.round(hr / 24)
  if (days < 7) return `hace ${days} día${days === 1 ? '' : 's'}`
  return formatDate(iso)
}

export const MODALITY_LABEL: Record<Modality, string> = {
  virtual: 'Virtual',
  'in-person': 'Presencial',
  both: 'Virtual y Presencial',
}
