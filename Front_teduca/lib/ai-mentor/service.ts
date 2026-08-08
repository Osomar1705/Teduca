/**
 * Servicio del Mentor IA.
 *
 * Antes este archivo contenía `buildReply()`: ~90 líneas de coincidencia de
 * palabras clave que devolvían frases escritas a mano y simulaban un retardo
 * para parecer IA. Eso se eliminó por completo; ahora se habla con un modelo
 * real a través de `/api/mentor`.
 */

import { getCourses, getCurrentUser } from '@/lib/edtech/service'
import { getOnboarding } from '@/lib/onboarding/service'
import { buildStudentContext } from './context'
import { buildSystemPrompt } from './prompts'
import type { MentorMessage, StudentContext } from './types'

/** Reúne todo lo que el mentor necesita saber del alumno. */
export async function loadStudentContext(): Promise<StudentContext> {
  const [user, courses] = await Promise.all([getCurrentUser(), getCourses()])

  // El onboarding puede no estar completo: es opcional, no debe romper el chat.
  const onboarding = await getOnboarding().catch(() => null)

  // `transcripts` queda vacío a propósito: las clases por videollamada aún no
  // ocurren. Cuando existan, se cargan acá y el prompt ya sabe usarlas.
  return buildStudentContext(user, courses, onboarding)
}

export class MentorError extends Error {}

/**
 * Envía la conversación al modelo y va entregando el texto a medida que llega.
 *
 * @param onChunk se invoca con cada fragmento nuevo; el llamador lo concatena.
 * @param signal permite cancelar la respuesta en curso (botón "Detener").
 */
export async function streamMentorReply(
  messages: MentorMessage[],
  context: StudentContext,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch('/api/mentor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      systemPrompt: buildSystemPrompt(context),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new MentorError(
      detail?.error ?? 'El mentor no pudo responder. Intenta de nuevo.',
    )
  }

  if (!response.body) {
    throw new MentorError('El mentor devolvió una respuesta vacía.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      onChunk(decoder.decode(value, { stream: true }))
    }
  } finally {
    reader.releaseLock()
  }
}
