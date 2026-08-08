'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { MentorChat } from '@/components/ai-mentor/MentorChat'
import { ConversationSidebar } from '@/components/ai-mentor/ConversationSidebar'
import { loadStudentContext } from '@/lib/ai-mentor/service'
import {
  createConversation,
  deleteConversation,
  listConversations,
  saveMessages,
} from '@/lib/ai-mentor/storage'
import { usePlatformStore } from '@/store/platformStore'
import { APP_ROUTES } from '@/lib/constants'
import type {
  Conversation,
  MentorMessage,
  StudentContext,
} from '@/lib/ai-mentor/types'

export default function MentorPage() {
  const router = useRouter()
  const { mode } = usePlatformStore()

  const [context, setContext] = useState<StudentContext | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // El mentor es una herramienta del alumno; en modo profesor no aplica.
  useEffect(() => {
    if (mode === 'profesor') router.replace(APP_ROUTES.DASHBOARD)
  }, [mode, router])

  useEffect(() => {
    if (mode === 'profesor') return

    async function init() {
      const [studentContext, saved] = await Promise.all([
        loadStudentContext(),
        listConversations(),
      ])
      setContext(studentContext)

      if (saved.length > 0) {
        setConversations(saved)
        setActiveId(saved[0].id)
      } else {
        const fresh = await createConversation()
        setConversations([fresh])
        setActiveId(fresh.id)
      }
      setLoading(false)
    }

    init().catch(() => setLoading(false))
  }, [mode])

  const active = conversations.find((c) => c.id === activeId) ?? null

  const handleMessagesChange = useCallback(
    (messages: MentorMessage[]) => {
      if (!activeId) return
      // Se actualiza el estado en cada fragmento del stream, pero el título
      // solo lo deriva la capa de persistencia y una única vez.
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages,
                title:
                  c.title === 'Nueva conversación' && messages[0]?.role === 'user'
                    ? messages[0].content.slice(0, 42)
                    : c.title,
              }
            : c,
        ),
      )
      saveMessages(activeId, messages).catch(() => {})
    },
    [activeId],
  )

  const handleCreate = useCallback(async () => {
    // Si la conversación actual está vacía, no tiene sentido crear otra.
    if (active && active.messages.length === 0) {
      setSidebarOpen(false)
      return
    }
    const fresh = await createConversation()
    setConversations((prev) => [fresh, ...prev])
    setActiveId(fresh.id)
    setSidebarOpen(false)
  }, [active])

  const handleSelect = useCallback((id: string) => {
    setActiveId(id)
    setSidebarOpen(false)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteConversation(id)
      const remaining = conversations.filter((c) => c.id !== id)

      if (remaining.length === 0) {
        const fresh = await createConversation()
        setConversations([fresh])
        setActiveId(fresh.id)
        return
      }

      setConversations(remaining)
      if (activeId === id) setActiveId(remaining[0].id)
    },
    [activeId, conversations],
  )

  if (mode === 'profesor') return null

  if (loading || !context || !active) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-10 w-56 rounded-xl" />
        <Skeleton className="h-[60svh] rounded-2xl" />
      </div>
    )
  }

  return (
    // Altura fija para que el composer quede anclado abajo y solo scrollee
    // el hilo de mensajes, como en ChatGPT.
    <div className="fixed inset-0 top-14 flex lg:relative lg:inset-auto lg:top-auto lg:h-[calc(100svh-6rem)] lg:overflow-hidden lg:rounded-2xl lg:border lg:border-border">
      {/* Sidebar fijo en escritorio */}
      <div className="hidden w-64 shrink-0 lg:block">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
      </div>

      {/* Sidebar deslizante en móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Cerrar panel"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 h-full w-72 bg-background shadow-xl">
            <ConversationSidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              onCreate={handleCreate}
              onDelete={handleDelete}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <MentorChat
          key={active.id}
          context={context}
          messages={active.messages}
          onMessagesChange={handleMessagesChange}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  )
}
