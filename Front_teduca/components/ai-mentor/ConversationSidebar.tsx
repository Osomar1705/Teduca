'use client'

import { useState } from 'react'
import { MessageSquare, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Conversation } from '@/lib/ai-mentor/types'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  /** Solo en móvil: cierra el panel deslizante. */
  onClose?: () => void
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onClose,
}: Props) {
  // Confirmación en dos pasos: borrar un chat no tiene deshacer.
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-muted/20">
      <div className="flex items-center gap-2 p-3">
        <Button
          variant="outline"
          className="flex-1 justify-start gap-2"
          onClick={onCreate}
        >
          <Plus className="size-4" />
          Nueva conversación
        </Button>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0 lg:hidden"
          >
            <X className="size-4" />
            <span className="sr-only">Cerrar panel</span>
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            Tus conversaciones aparecerán acá.
          </p>
        ) : (
          conversations.map((conversation) => {
            const isActive = conversation.id === activeId
            const isConfirming = conversation.id === confirmingId

            return (
              <div
                key={conversation.id}
                className={cn(
                  'group flex items-center gap-1 rounded-lg pr-1 transition-colors',
                  isActive ? 'bg-muted' : 'hover:bg-muted/60',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5 text-left"
                >
                  <MessageSquare
                    className={cn(
                      'size-4 shrink-0',
                      isActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                  <span
                    className={cn(
                      'truncate text-sm',
                      isActive
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {conversation.title}
                  </span>
                </button>

                {isConfirming ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(conversation.id)
                        setConfirmingId(null)
                      }}
                      className="rounded px-1.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      Borrar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="rounded px-1.5 py-1 text-xs text-muted-foreground hover:bg-muted"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(conversation.id)}
                    aria-label={`Borrar "${conversation.title}"`}
                    className="shrink-0 rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus:opacity-100 group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </nav>
    </aside>
  )
}
