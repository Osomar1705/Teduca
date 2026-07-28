import { z } from 'zod'

export const createCourseSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.string().min(1, 'Selecciona una categoría'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
})

export type CreateCourseFormData = z.infer<typeof createCourseSchema>

export const updateCourseSchema = createCourseSchema.extend({
  courseId: z.string(),
})

export type UpdateCourseFormData = z.infer<typeof updateCourseSchema>

export const createLessonSchema = z.object({
  courseId: z.string(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  content: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres'),
  videoUrl: z.string().url('URL de video inválida').optional().or(z.literal('')),
  order: z.number().min(1),
})

export type CreateLessonFormData = z.infer<typeof createLessonSchema>
