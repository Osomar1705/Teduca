'use client'

import { useCallback, useEffect, useState } from 'react'
import { User } from '@/lib/types'
import { authClient } from '@/lib/auth-client'

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    email: string,
    password: string,
    name: string,
    role?: 'student' | 'teacher'
  ) => Promise<void>
  logout: () => Promise<void>
  error: Error | null
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let active = true
    authClient
      .getSession()
      .then((session) => {
        if (active) setUser(session?.user ?? null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    const { data, error } = await authClient.signIn.email({ email, password })
    if (error) {
      const e = new Error(error.message)
      setError(e)
      throw e
    }
    setUser(data ?? null)
  }, [])

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      role: 'student' | 'teacher' = 'student'
    ) => {
      setError(null)
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        role,
      })
      if (error) {
        const e = new Error(error.message)
        setError(e)
        throw e
      }
      setUser(data ?? null)
    },
    []
  )

  const logout = useCallback(async () => {
    await authClient.signOut()
    setUser(null)
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
  }
}
