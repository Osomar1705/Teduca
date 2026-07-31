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

export const MODALITY_LABEL: Record<Modality, string> = {
  virtual: 'Virtual',
  'in-person': 'Presencial',
  both: 'Virtual y Presencial',
}
