import { apiClient } from '../api-client'
import { API_ENDPOINTS } from '../constants'
import type { ParticipationStats } from './types'

/**
 * Obtiene las estadísticas de participación del usuario autenticado
 * desde el endpoint GET /api/v1/participation/me.
 */
export async function getParticipationStats(): Promise<ParticipationStats | null> {
  try {
    return await apiClient.get<ParticipationStats>(API_ENDPOINTS.PARTICIPATION.ME)
  } catch {
    return null
  }
}
