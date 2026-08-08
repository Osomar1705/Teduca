'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUp, Brain, PanelLeft, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MentorError, streamMentorReply } from '@/lib/ai-mentor/service'
import { newId } from '@/lib/ai-mentor/storage'
import type { MentorMessage, StudentContext } from '@/lib/ai-mentor/types'

const SUGGESTIONS = [
  'Explícame un concepto que no entiendo',
  'Ayúdame a organizar mi semana de estudio',
  'Hazme preguntas de repaso',
  'Resúmeme lo que estoy llevando',
]

interface Props {
  context: StudentContext
  messages: MentorMessage[]
  onMessagesChange: (messages: MentorMessage[]) => void
  /** Abre el sidebar en móvil. */
  onOpenSidebar: () => void
}

export function MentorChat({
  context,
  messages,
  onMessagesChange,
  onOpenSidebar,
}: Props) {
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const firstName = context.userName.split(' ')[0] || 'estudiante'
  const isEmpty = messages.length === 0

  // Autoscroll mientras llega la respuesta.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: streaming ? 'auto' : 'smooth',
    })
  }, [messages, streaming])

  // El textarea crece con el contenido, hasta un tope.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  // Cancela el stream si el usuario abandona la pantalla.
  useEffect(() => () => abortRef.current?.abort(), [])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStreaming(false)
  }, [])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || streaming) return

      setError(null)
      setInput('')

      const userMessage: MentorMessage = {
        id: newId(),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      }
      const assistantMessage: MentorMessage = {
        id: newId(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      }

      const withUser = [...messages, userMessage]
      // Se pinta de inmediato la burbuja vacía del mentor: es lo que da la
      // sensación de "está escribiendo" sin necesidad de un estado aparte.
      onMessagesChange([...withUser, assistantMessage])
      setStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      let accumulated = ''
      try {
        await streamMentorReply(
          withUser,
          context,
          (chunk) => {
            accumulated += chunk
            onMessagesChange([
              ...withUser,
              { ...assistantMessage, content: accumulated },
            ])
          },
          controller.signal,
        )

        if (!accumulated.trim()) {
          throw new MentorError('El mentor no devolvió respuesta. Intenta de nuevo.')
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Cancelado por el usuario: se conserva lo que alcanzó a escribir.
          onMessagesChange(
            accumulated.trim()
              ? [...withUser, { ...assistantMessage, content: accumulated }]
              : withUser,
          )
        } else {
          setError(
            err instanceof MentorError
              ? err.message
              : 'No se pudo conectar con el mentor. Revisa tu conexión.',
          )
          // Se descarta la burbuja vacía para no dejar un hueco en el hilo.
          onMessagesChange(withUser)
        }
      } finally {
        abortRef.current = null
        setStreaming(false)
      }
    },
    [context, messages, onMessagesChange, streaming],
  )

  return (
    <div className="flex h-full flex-col">
      {/* Cabecera: solo existe en móvil, para poder abrir el sidebar. */}
      <header className="flex items-center gap-2 border-b border-border px-3 py-2.5 lg:hidden">
        <Button variant="ghost" size="icon" onClick={onOpenSidebar}>
          <PanelLeft className="size-4" />
          <span className="sr-only">Ver conversaciones</span>
        </Button>
        <p className="text-sm font-semibold text-foreground">Mentor TEDUCA</p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                <Brain className="size-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Hola, {firstName}
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {context.courses.length > 0
                  ? `Conozco los ${context.courses.length} curso(s) que estás llevando. Pregúntame lo que necesites.`
                  : 'Pregúntame lo que necesites sobre lo que estás estudiando.'}
              </p>

              <div className="mt-8 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) =>
                message.role === 'user' ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex gap-3">
                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Brain className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {message.content || (
                        <span className="inline-flex items-center gap-1 py-1">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-end gap-2 rounded-2xl border border-input bg-background p-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Enter envía; Shift+Enter hace salto de línea.
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              placeholder="Pregúntale a tu mentor..."
              className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            {streaming ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={stop}
                className="shrink-0 rounded-xl"
              >
                <Square className="size-3.5 fill-current" />
                <span className="sr-only">Detener</span>
              </Button>
            ) : (
              <Button
                type="submit"
                variant="brand"
                size="icon"
                disabled={!input.trim()}
                className="shrink-0 rounded-xl"
              >
                <ArrowUp className="size-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            )}
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            El mentor puede equivocarse. Verifica lo importante con tu profesor.
          </p>
        </div>
      </div>
    </div>
  )
}
