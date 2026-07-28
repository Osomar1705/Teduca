import { z } from 'zod'

export const createAssignmentSchema = z.object({
  courseId: z.string(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres'),
  dueDate: z.date().min(new Date(), 'La fecha debe ser futura'),
})

export type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>

export const submitAssignmentSchema = z.object({
  assignmentId: z.string(),
  submission: z
    .string()
    .min(10, 'La entrega debe tener al menos 10 caracteres'),
})

export type SubmitAssignmentFormData = z.infer<typeof submitAssignmentSchema>

export const gradeAssignmentSchema = z.object({
  assignmentId: z.string(),
  grade: z.number().min(0).max(100, 'La calificación debe estar entre 0 y 100'),
  feedback: z
    .string()
    .min(10, 'El feedback debe tener al menos 10 caracteres')
    .optional(),
})

export type GradeAssignmentFormData = z.infer<typeof gradeAssignmentSchema>
