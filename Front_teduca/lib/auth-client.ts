'use client'

/**
 * Cliente de autenticación contra el backend FastAPI.
 *
 * Conserva una superficie compatible con la que ya consumían los componentes
 * (`authClient.signIn.email`, `signUp.email`, `signOut`) para minimizar cambios,
 * pero por debajo usa JWT (access/refresh) emitidos por FastAPI.
 */

import { apiClient } from './api-client'
import { API_ENDPOINTS } from './constants'
import type { User } from './types'
import {
  clearTokens,
  getRefreshToken,
  setTokens,
  type TokenPair,
} from './auth-tokens'

interface AuthResponse {
  user: User
  tokens: TokenPair
}

interface Result<T = void> {
  data?: T
  error?: { message: string } | null
}

async function login(email: string, password: string): Promise<Result<User>> {
  try {
    const res = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password },
      { auth: false }
    )
    setTokens(res.tokens)
    return { data: res.user, error: null }
  } catch (err) {
    return { error: { message: (err as Error).message } }
  }
}

async function register(
  email: string,
  password: string,
  name: string,
  role: 'student' | 'teacher' = 'student'
): Promise<Result<User>> {
  try {
    const res = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      { email, password, name, role },
      { auth: false }
    )
    setTokens(res.tokens)
    return { data: res.user, error: null }
  } catch (err) {
    return { error: { message: (err as Error).message } }
  }
}

interface AuthConfig {
  google_enabled: boolean
  google_client_id: string | null
}

/** Configuración pública de auth: decide si mostrar el botón de Google. */
async function getAuthConfig(): Promise<AuthConfig> {
  try {
    return await apiClient.get<AuthConfig>(API_ENDPOINTS.AUTH.CONFIG, {
      auth: false,
    })
  } catch {
    // Si el backend no responde, degradar a "sin Google" en vez de romper.
    return { google_enabled: false, google_client_id: null }
  }
}

/** Login/registro con el credential (ID token) de Google Identity Services. */
async function googleLogin(credential: string): Promise<Result<User>> {
  try {
    const res = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.GOOGLE,
      { credential },
      { auth: false }
    )
    setTokens(res.tokens)
    return { data: res.user, error: null }
  } catch (err) {
    return { error: { message: (err as Error).message } }
  }
}

async function logout(): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
      refresh_token: getRefreshToken(),
    })
  } catch {
    /* la sesión se limpia igual localmente */
  } finally {
    clearTokens()
  }
}

async function getSession(): Promise<{ user: User } | null> {
  try {
    const user = await apiClient.get<User>(API_ENDPOINTS.AUTH.SESSION)
    return { user }
  } catch {
    return null
  }
}

export const authClient = {
  signIn: {
    email: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
  },
  signUp: {
    email: ({
      email,
      password,
      name,
      role,
    }: {
      email: string
      password: string
      name: string
      role?: 'student' | 'teacher'
    }) => register(email, password, name, role),
  },
  signInWithGoogle: (credential: string) => googleLogin(credential),
  signOut: async (opts?: { fetchOptions?: { onSuccess?: () => void } }) => {
    await logout()
    opts?.fetchOptions?.onSuccess?.()
    return { error: null }
  },
  getSession,
  getConfig: getAuthConfig,
}

export { login, register, googleLogin, getAuthConfig, logout, getSession }
export type { AuthConfig }
