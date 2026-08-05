'use client'

/**
 * platformStore — gestiona el modo activo de TEDUCA (Alumno / Profesor)
 * y el rol del usuario.
 *
 * Persiste en localStorage para que el modo sobreviva a recargas.
 * La lógica de restricción de acceso se aplica aquí:
 *  - Solo los usuarios con rol 'teacher' o 'admin' pueden activar el modo profesor.
 *  - Los demás son redirigidos a /become-teacher.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '@/lib/constants'

export type PlatformMode = 'alumno' | 'profesor'

interface PlatformStore {
  mode: PlatformMode
  /** Rol real del usuario, sincronizado desde la sesión del backend. */
  userRole: UserRole

  setMode: (mode: PlatformMode) => 'ok' | 'restricted'
  setUserRole: (role: UserRole) => void
  /** Devuelve si el usuario puede activar el modo Profesor. */
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
        set({ userRole: role })
        // Si el usuario ya no puede ser profesor, vuelve al modo alumno
        if (role !== UserRole.TEACHER && role !== UserRole.ADMIN) {
          set({ mode: 'alumno' })
        }
      },

      canAccessTeacher: () => {
        const { userRole } = get()
        return userRole === UserRole.TEACHER || userRole === UserRole.ADMIN
      },
    }),
    {
      name: 'teduca-platform',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
)
