'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageCircle, Send } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FadeIn } from '@/components/common/Motion'
import {
  getChatMessages,
  getChatThreads,
  getCurrentUser,
  openChatThread,
  sendChatMessage,
} from '@/lib/edtech/service'
import type { ChatMessage, ChatThread } from '@/lib/edtech/types'
import { cn } from '@/lib/utils'

/** Cada cuántos ms se refrescan los mensajes del hilo abierto. */
const POLL_MS = 4000

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MessagesContent() {
  const searchParams = useSearchParams()
  const teacherParam = searchParams.get('teacher')

  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Carga inicial: usuario, hilos y (si viene ?teacher=) abre/crea ese hilo.
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [user, list] = await Promise.all([getCurrentUser(), getChatThreads()])
        if (!active) return
        setMyUserId(user.id)
        setThreads(list)

        if (teacherParam) {
          try {
            const thread = await openChatThread(teacherParam)
            if (!active) return
            setActiveThread(thread)
            setThreads((prev) =>
              prev.some((t) => t.id === thread.id) ? prev : [thread, ...prev]
            )
          } catch (err) {
            if (active) setError((err as Error).message)
          }
        } else if (list.length) {
          setActiveThread(list[0])
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [teacherParam])

  const refreshMessages = useCallback(async () => {
    if (!activeThread) return
    try {
      setMessages(await getChatMessages(activeThread.id))
    } catch {
      /* siguiente poll reintenta */
    }
  }, [activeThread])

  // Mensajes del hilo activo + polling (primer fetch diferido a un tick).
  useEffect(() => {
    if (!activeThread) return
    const timeout = setTimeout(refreshMessages, 0)
    const interval = setInterval(refreshMessages, POLL_MS)
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [activeThread, refreshMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const body = draft.trim()
    if (!body || !activeThread || sending) return
    setSending(true)
    try {
      const message = await sendChatMessage(activeThread.id, body)
      setMessages((prev) => [...prev, message])
      setDraft('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Mensajes"
        description="Conversá con los profesores con los que hiciste match."
      />

      {error && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {threads.length === 0 ? (
        <FadeIn>
          <Card className="flex flex-col items-center gap-3 p-10 text-center">
            <MessageCircle className="size-10 text-muted-foreground" />
            <p className="font-medium text-foreground">Todavía no tenés conversaciones</p>
            <p className="text-sm text-muted-foreground">
              Hacé match con un profesor en Descubrir para empezar a chatear.
            </p>
          </Card>
        </FadeIn>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          {/* Lista de hilos */}
          <Card className="h-fit overflow-hidden p-2 lg:max-h-[70vh] lg:overflow-y-auto">
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveThread(thread)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
                  activeThread?.id === thread.id
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thread.teacherAvatar}
                  alt={thread.teacherName}
                  className="size-10 shrink-0 rounded-xl border border-border object-cover"
                />
                <span className="truncate text-sm font-medium">{thread.teacherName}</span>
              </button>
            ))}
          </Card>

          {/* Conversación */}
          <Card className="flex h-[70vh] flex-col overflow-hidden p-0">
            {activeThread ? (
              <>
                <div className="flex items-center gap-3 border-b border-border p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeThread.teacherAvatar}
                    alt={activeThread.teacherName}
                    className="size-9 rounded-xl border border-border object-cover"
                  />
                  <p className="font-semibold text-foreground">
                    {activeThread.teacherName}
                  </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <p className="pt-10 text-center text-sm text-muted-foreground">
                      Escribí el primer mensaje para romper el hielo.
                    </p>
                  ) : (
                    messages.map((message) => {
                      const mine = message.senderId === myUserId
                      return (
                        <div
                          key={message.id}
                          className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                              mine
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{message.body}</p>
                            <p
                              className={cn(
                                'mt-1 text-right text-[10px]',
                                mine
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-2 border-t border-border p-3"
                >
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escribí un mensaje..."
                    aria-label="Mensaje"
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    variant="brand"
                    size="icon"
                    disabled={sending || !draft.trim()}
                    aria-label="Enviar"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Elegí una conversación para empezar.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  )
}
