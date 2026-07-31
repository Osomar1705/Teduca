'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SwipeDeck } from '@/components/edtech/SwipeDeck'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/lib/constants'

export default function SwipePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={APP_ROUTES.DISCOVER}>
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Descubrir · Modo swipe
        </h1>
        <span className="w-16" />
      </div>

      <p className="mb-6 text-center text-sm text-muted-foreground">
        Deslizá a la derecha si te interesa, a la izquierda para pasar.
        <br className="hidden sm:block" />
        También podés usar los botones.
      </p>

      <SwipeDeck />
    </div>
  )
}
