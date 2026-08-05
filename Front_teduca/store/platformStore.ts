'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '@/lib/constants'

export type PlatformMode = 'alumno' | 'profesor'

interface PlatformStore {
  mode: PlatformMode
  userRole: UserRole

  setMode: (mode: PlatformMode) => 'ok' | 'restricted'
  /** Sincroniza el rol real desde la sesión del backend. */
  setUserRole: (role: UserRole) => void
  canAccessTeacher: () => boolean
}

export const usePlatformStore = create<PlatformStore>()(
  persist(
    (set, get) => ({
      mode: 'alumno',
      userRole: UserRole.STUDENT,

      setMode: (mode) => {
        if (mode === 'profesor') {
          const { userRole } = get()
          if (userRole !== UserRole.TEACHER && userRole !== UserRole.ADMIN) {
            return 'restricted'
          }
        }
        set({ mode })
        return 'ok'
      },

      setUserRole: (role) => {
        const prev = get()
        // Forzar modo alumno si el usuario ya no puede ser Profesor
        const canTeach = role === UserRole.TEACHER || role === UserRole.ADMIN
        set({
          userRole: role,
          mode: !canTeach && prev.mode === 'profesor' ? 'alumno' : prev.mode,
        })
      },

      canAccessTeacher: () => {
        const { userRole } = get()
        return userRole === UserRole.TEACHER || userRole === UserRole.ADMIN
      },
    }),
    {
      name: 'teduca-platform',
      // Persiste tanto mode como userRole para evitar flash al recargar
      partialize: (state) => ({ mode: state.mode, userRole: state.userRole }),
    }
  )
)
