'use client'

import { useEffect, useRef, useState } from 'react'
import { Brain, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { sendMessage } from '@/lib/ai-mentor/service'
import { loadMemory, saveMemory } from '@/lib/ai-mentor/memory'
import type { MentorContext, MentorMessage } from '@/lib/ai-mentor/types'

const SUGGESTIONS = [
  '¿Cómo organizo mi semana?',
  'Recomiéndame un curso',
  '¿Cómo mejoro mi racha?',
  'Explícame un concepto',
]

function uid() {
  return Math.random().toString(36).slice(2)
}

interface Props {
  context: MentorContext
  onClose?: () => void
}

export function MentorChat({ context, onClose }: Props) {
  const firstName = context.userName.split(' ')[0] || 'estudiante'

  const [messages, setMessages] = useState<MentorMessage[]>(() => {
    const memory = loadMemory()
    if (memory.chatHistory.length > 0) return memory.chatHistory
    return [
      {
        id: 'welcome',
        role: 'mentor',
        content: `¡Hola ${firstName}! Soy tu mentor académico. Estoy acá para ayudarte a organizar tu estudio, resolver dudas y mantenerte motivado. ¿En qué querés que trabajemos hoy?`,
        createdAt: new Date().toISOString(),
      },
    ]
  })

  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  // Persist chat history
  useEffect(() => {
    const memory = loadMemory()
    saveMemory({ ...memory, chatHistory: messages, lastSeen: new Date().toISOString() })
  }, [messages])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: MentorMessage = {
      id: uid(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const reply = await sendMessage(history, trimmed, context)
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: 'mentor', content: reply, createdAt: new Date().toISOString() },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
          <Brain className="size-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Mentor TEDUCA</p>
          <p className="text-xs text-muted-foreground">Tu asistente académico personal</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="size-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn('flex gap-2', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {m.role === 'mentor' && (
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                <Brain className="size-3.5 text-primary" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'rounded-br-md bg-primary text-primary-foreground'
                  : 'rounded-bl-md bg-muted/60 text-foreground'
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start gap-2">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
              <Brain className="size-3.5 text-primary" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted/60 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick suggestions (only on first message) */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2 border-t border-border bg-background/60 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribile a tu mentor..."
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
        />
        <Button type="submit" variant="brand" size="icon-lg" disabled={loading || !input.trim()}>
          <Send className="size-4" />
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  )
}
