/**
 * Cliente HTTP para consumir el backend FastAPI de TEDUCA.
 * - Adjunta el access token (Bearer) automáticamente.
 * - Ante un 401, intenta refrescar el token una vez y reintenta la petición.
 */

import { ERROR_MESSAGES } from './constants'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './auth-tokens'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface FetchOptions extends RequestInit {
  auth?: boolean // adjuntar Authorization (default: true)
  retry?: boolean // control interno de reintento tras refresh
}

class APIClient {
  private baseUrl: string
  private refreshing: Promise<boolean> | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private buildHeaders(options?: FetchOptions): Headers {
    const headers = new Headers(options?.headers)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
    if (options?.auth !== false) {
      const token = getAccessToken()
      if (token) headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  }

  private async tryRefresh(): Promise<boolean> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return false

    // Evita múltiples refresh simultáneos.
    if (!this.refreshing) {
      this.refreshing = (async () => {
        try {
          const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          })
          if (!res.ok) return false
          const tokens = await res.json()
          setTokens(tokens)
          return true
        } catch {
          return false
        } finally {
          this.refreshing = null
        }
      })()
    }
    return this.refreshing
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: this.buildHeaders(options),
    })

    if (response.status === 401 && options.auth !== false && !options.retry) {
      const refreshed = await this.tryRefresh()
      if (refreshed) {
        return this.request<T>(endpoint, { ...options, retry: true })
      }
      clearTokens()
      throw new Error(ERROR_MESSAGES.AUTHENTICATION_REQUIRED)
    }

    if (!response.ok) {
      throw await this.toError(response)
    }

    if (response.status === 204) return null as T
    try {
      return (await response.json()) as T
    } catch {
      return null as T
    }
  }

  private async toError(response: Response): Promise<Error> {
    let detail: string | undefined
    try {
      const body = await response.json()
      detail = body?.detail || body?.error || body?.message
    } catch {
      /* respuesta sin cuerpo JSON */
    }
    if (detail) return new Error(detail)
    switch (response.status) {
      case 403:
        return new Error(ERROR_MESSAGES.UNAUTHORIZED)
      case 404:
        return new Error(ERROR_MESSAGES.NOT_FOUND)
      default:
        return new Error(ERROR_MESSAGES.SERVER_ERROR)
    }
  }

  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  patch<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new APIClient()
