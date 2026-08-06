'use client'

import { Flame, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RankingEntry } from '@/lib/rewards/types'

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export function RankingTable({ entries }: { entries: RankingEntry[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">#</th>
            <th className="px-4 py-3 font-medium">Estudiante</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Score</th>
            <th className="px-4 py-3 font-medium">Orbits</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Racha</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr
              key={e.userId}
              className={cn(
                'border-b border-border/60 last:border-0 transition-colors',
                e.isCurrentUser ? 'bg-primary/10' : 'hover:bg-muted/30',
              )}
            >
              <td className="px-4 py-3">
                <span className="inline-flex min-w-6 items-center font-semibold text-foreground">
                  {MEDALS[e.position] ?? e.position}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {e.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {e.name}
                      {e.isCurrentUser && (
                        <span className="ml-1.5 text-xs text-primary">(tú)</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {e.career ?? e.university ?? '—'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="hidden px-4 py-3 font-mono text-muted-foreground sm:table-cell">
                {e.score}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 font-mono font-semibold text-foreground">
                  <Star className="size-3.5 text-primary" />
                  {e.pointsBalance}
                </span>
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Flame className="size-3.5 text-orange-500" />
                  {e.streak}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
