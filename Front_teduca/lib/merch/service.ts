import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/constants'
import type { MerchProduct } from './types'

export async function getMerchProducts(): Promise<MerchProduct[]> {
  return apiClient.get<MerchProduct[]>(API_ENDPOINTS.MERCH.LIST, { auth: false })
}

export async function getMerchProduct(id: string): Promise<MerchProduct> {
  return apiClient.get<MerchProduct>(API_ENDPOINTS.MERCH.GET(id), { auth: false })
}
