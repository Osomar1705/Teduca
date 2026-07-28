'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Upload, Loader } from 'lucide-react'

interface SubmitAssignmentFormProps {
  assignmentId: string
  onSubmitSuccess?: () => void
}

export function SubmitAssignmentForm({
  assignmentId,
  onSubmitSuccess,
}: SubmitAssignmentFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file && !content) {
      setError('Por favor, carga un archivo o escribe contenido')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const formData = new FormData()
      if (file) {
        formData.append('file', file)
      }
      formData.append('content', content)
      formData.append('assignmentId', assignmentId)

      const response = await fetch('/api/assignments/submit', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error al enviar la tarea')
      }

      setSuccess(true)
      setFile(null)
      setContent('')
      onSubmitSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Error al enviar la tarea')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Enviar tarea</h2>
        <p className="text-sm text-muted-foreground">
          Puedes adjuntar un archivo o escribir tu respuesta directamente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label>Archivo (opcional)</Label>
          <div className="relative">
            <Input
              type="file"
              className="cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isLoading}
            />
            {file && (
              <p className="text-sm text-muted-foreground mt-2">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <Label htmlFor="content">Contenido (opcional)</Label>
          <textarea
            id="content"
            placeholder="Escribe tu respuesta aquí..."
            className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-md bg-accent/10 p-4 text-sm text-accent">
            Tarea enviada exitosamente
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading && <Loader className="h-4 w-4 animate-spin" />}
          {isLoading ? 'Enviando...' : 'Enviar tarea'}
        </Button>
      </form>
    </Card>
  )
}
