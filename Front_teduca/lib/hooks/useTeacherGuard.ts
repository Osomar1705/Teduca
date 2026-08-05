'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePlatformStore } from '@/store/platformStore'
import { APP_ROUTES, UserRole } from '@/lib/constants'

/**
 * Redirige a /dashboard si el usuario no tiene rol de Profesor.
 * Úsalo al tope de cualquier página de /teacher/*.
 */
export function useTeacherGuard() {
  const { userRole } = usePlatformStore()
  const router = useRouter()

  useEffect(() => {
    const allowed = userRole === UserRole.TEACHER || userRole === UserRole.ADMIN
    if (!allowed) {
      router.replace(APP_ROUTES.BECOME_TEACHER)
    }
  }, [userRole, router])

  const isAllowed = userRole === UserRole.TEACHER || userRole === UserRole.ADMIN
  return { isAllowed }
}
