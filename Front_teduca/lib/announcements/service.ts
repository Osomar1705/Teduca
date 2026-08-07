import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { Announcement } from './types'

export async function getAnnouncements(): Promise<Announcement[]> {
  return apiClient.get<Announcement[]>(API_ENDPOINTS.ANNOUNCEMENTS.LIST, { auth: false })
}
