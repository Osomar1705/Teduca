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
  signOut: async (opts?: { fetchOptions?: { onSuccess?: () => void } }) => {
    await logout()
    opts?.fetchOptions?.onSuccess?.()
    return { error: null }
  },
  getSession,
}

export { login, register, logout, getSession }
