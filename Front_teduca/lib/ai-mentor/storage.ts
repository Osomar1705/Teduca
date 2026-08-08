/**
 * Persistencia de las conversaciones del Mentor.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE CAMBIAR PARA MIGRAR A SUPABASE/FASTAPI.
 *
 * Hoy guarda en localStorage (el chat vive solo en el navegador del alumno).
 * Cuando se decida el backend definitivo, se reescribe el cuerpo de estas
 * funciones para que hagan fetch, y ningún componente del chat se toca: todas
 * son async justamente para que ese cambio no altere las firmas.
 *
 * Limitación actual, a tener presente: el historial NO viaja entre
 * dispositivos y se pierde si el alumno limpia el navegador.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { Conversation, MentorMessage } from './types'

const STORE_KEY = 'teduca_mentor_conversations'

/** Tope de conversaciones guardadas; localStorage ronda los 5 MB. */
const MAX_CONVERSATIONS = 30
/** Tope de mensajes por conversación. */
const MAX_MESSAGES = 200

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function readAll(): Conversation[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(STORE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Conversation[]) : []
  } catch {
    return []
  }
}

function writeAll(conversations: Conversation[]): void {
  if (!isBrowser()) return
  const trimmed = conversations
    .slice(0, MAX_CONVERSATIONS)
    .map((c) => ({ ...c, messages: c.messages.slice(-MAX_MESSAGES) }))
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(trimmed))
  } catch {
    // Cuota llena: se descarta la conversación más antigua y se reintenta una vez.
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(trimmed.slice(0, -1)))
    } catch {
      // Sin espacio: se ignora en silencio antes que romper el chat.
    }
  }
}

/** Título a partir del primer mensaje del alumno, al estilo ChatGPT. */
export function deriveTitle(text: string): string {
  const clean = text.trim().replace(/\s+/g, ' ')
  if (!clean) return 'Nueva conversación'
  return clean.length > 42 ? `${clean.slice(0, 42).trimEnd()}…` : clean
}

// ─── API pública ────────────────────────────────────────────────────────────

/** Conversaciones ordenadas de más reciente a más antigua. */
export async function listConversations(): Promise<Conversation[]> {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return readAll().find((c) => c.id === id) ?? null
}

export async function createConversation(): Promise<Conversation> {
  const now = new Date().toISOString()
  const conversation: Conversation = {
    id: newId(),
    title: 'Nueva conversación',
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
  writeAll([conversation, ...readAll()])
  return conversation
}

/** Reemplaza los mensajes de una conversación y refresca su título si hacía falta. */
export async function saveMessages(
  id: string,
  messages: MentorMessage[],
): Promise<void> {
  const all = readAll()
  const index = all.findIndex((c) => c.id === id)
  if (index === -1) return

  const current = all[index]
  const firstUserMessage = messages.find((m) => m.role === 'user')
  const title =
    current.title === 'Nueva conversación' && firstUserMessage
      ? deriveTitle(firstUserMessage.content)
      : current.title

  all[index] = {
    ...current,
    title,
    messages,
    updatedAt: new Date().toISOString(),
  }
  writeAll(all)
}

export async function renameConversation(id: string, title: string): Promise<void> {
  const all = readAll()
  const index = all.findIndex((c) => c.id === id)
  if (index === -1) return
  all[index] = { ...all[index], title: deriveTitle(title) }
  writeAll(all)
}

export async function deleteConversation(id: string): Promise<void> {
  writeAll(readAll().filter((c) => c.id !== id))
}

export async function deleteAllConversations(): Promise<void> {
  writeAll([])
}
