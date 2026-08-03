'use client'

/**
 * Almacén de tokens JWT del backend FastAPI.
 * - access/refresh se guardan en localStorage (los usa el api-client).
 * - Se marca una cookie no sensible `teduca_auth` para que el middleware
 *   (que corre en el edge, sin acceso a localStorage) sepa si hay sesión.
 */

const ACCESS_KEY = 'teduca_access_token'
const REFRESH_KEY = 'teduca_refresh_token'
export const AUTH_COOKIE = 'teduca_auth'

export interface TokenPair {
  access_token: string
  refresh_token: string
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(REFRESH_KEY)
}

export function setTokens(tokens: TokenPair): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACCESS_KEY, tokens.access_token)
  window.localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=604800; SameSite=Lax${secure}`
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACCESS_KEY)
  window.localStorage.removeItem(REFRESH_KEY)
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`
}
