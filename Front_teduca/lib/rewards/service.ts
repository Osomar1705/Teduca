import type { Reward, RewardBalance } from './types'
import { getGamificationState } from '../gamification/service'

/**
 * Servicio de recompensas. La estructura está lista para conectarse al backend
 * (`/api/v1/rewards`). Hoy devuelve ejemplos marcados como "próximamente".
 */

export function getRewardBalance(): RewardBalance {
  const { xp } = getGamificationState()
  return {
    total: xp,
    unit: 'puntos',
    label: 'Puntos académicos',
  }
}

const SAMPLE_REWARDS: Reward[] = [
  {
    id: 'descuento-cafeteria',
    name: 'Descuento en cafetería',
    description: '15% de descuento en tu próxima compra dentro del campus.',
    value: 15,
    unit: '%',
    type: 'food',
    status: 'locked',
    partner: 'Cafetería Central',
  },
  {
    id: 'pase-transporte',
    name: 'Pase de transporte',
    description: 'Un pase semanal de transporte universitario.',
    value: 1,
    unit: 'pase',
    type: 'transport',
    status: 'locked',
    partner: 'Movilidad Campus',
  },
  {
    id: 'merch-teduca',
    name: 'Kit TEDUCA',
    description: 'Stickers y una taza de la comunidad TEDUCA.',
    value: 1,
    unit: 'kit',
    type: 'merchandise',
    status: 'locked',
  },
  {
    id: 'mentoria-premium',
    name: 'Mentoría premium',
    description: 'Una sesión de mentoría 1:1 con un profesor destacado.',
    value: 1,
    unit: 'sesión',
    type: 'benefit',
    status: 'locked',
  },
]

export function getAvailableRewards(): Reward[] {
  return SAMPLE_REWARDS
}
