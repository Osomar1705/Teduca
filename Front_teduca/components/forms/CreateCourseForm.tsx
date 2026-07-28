'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createCourseSchema,
  type CreateCourseFormData,
} from '@/lib/schemas/course.schema'
import { apiClient } from '@/lib/api-client'
import { API_ENDPOINTS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader } from 'lucide-react'

export function CreateCourseForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      level: 'beginner',
      category: 'general',
    },
  })

  const level = watch('level')
  const category = watch('category')

  const onSubmit = async (data: CreateCourseFormData) => {
    try {
      setIsLoading(true)
      setError('')

      const course = await apiClient.post<{ id: string }>(
        API_ENDPOINTS.COURSES.CREATE,
        data
      )
      router.push(`/courses/${course.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Error al crear el curso')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Crear nuevo curso</h1>
        <p className="text-muted-foreground mt-2">
          Completa los detalles básicos de tu curso
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Título del curso</Label>
          <Input
            id="title"
            placeholder="Ej: Introducción a React"
            {...register('title')}
            disabled={isLoading}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            placeholder="Describe el contenido y los objetivos del curso"
            className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('description')}
            disabled={isLoading}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select
            value={category}
            onValueChange={(value) => setValue('category', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="programming">Programación</SelectItem>
              <SelectItem value="languages">Idiomas</SelectItem>
              <SelectItem value="business">Negocios</SelectItem>
              <SelectItem value="design">Diseño</SelectItem>
              <SelectItem value="science">Ciencias</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Level */}
        <div className="space-y-2">
          <Label htmlFor="level">Nivel</Label>
          <Select
            value={level}
            onValueChange={(value: any) => setValue('level', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Principiante</SelectItem>
              <SelectItem value="intermediate">Intermedio</SelectItem>
              <SelectItem value="advanced">Avanzado</SelectItem>
            </SelectContent>
          </Select>
          {errors.level && (
            <p className="text-sm text-destructive">{errors.level.message}</p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Creando...' : 'Crear curso'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
