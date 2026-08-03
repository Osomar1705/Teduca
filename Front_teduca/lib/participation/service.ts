import type { ParticipationStats } from './types'

/**
 * Estadísticas de participación. El backend aún no expone este recurso, por lo
 * que devolvemos `null` y la UI muestra un estado vacío motivador. Cuando el
 * endpoint (`/api/v1/participation/me`) esté disponible, este stub se
 * reemplaza por la llamada real sin cambiar la firma.
 */
export async function getParticipationStats(): Promise<ParticipationStats | null> {
  return null
}
