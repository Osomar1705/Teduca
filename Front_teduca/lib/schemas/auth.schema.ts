import { z } from 'zod'
import { UserRole } from '../constants'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'La contraseña debe contener mayúsculas, minúsculas y números'
      ),
    confirmPassword: z.string(),
    role: z.enum([UserRole.STUDENT, UserRole.TEACHER]),
    acceptTerms: z.boolean().refine((val) => val, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  bio: z.string().max(500, 'La biografía debe tener máximo 500 caracteres').optional(),
  phone: z.string().optional(),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
