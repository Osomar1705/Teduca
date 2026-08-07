'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ShoppingBag, Package } from 'lucide-react'

import { getMerchProducts } from '@/lib/merch/service'
import type { MerchProduct } from '@/lib/merch/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number | null, currency: string): string {
  if (price === null) return 'Consultar precio'
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency }).format(price)
}

function whatsappLink(product: MerchProduct): string {
  const msg = encodeURIComponent(
    `Hola, me interesa el producto "${product.name}" de TEDUCA. ¿Podrían darme más información?`
  )
  return `https://wa.me/51934317464?text=${msg}`
}

// ── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({ product, onClick }: { product: MerchProduct; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-xl border border-border/60 bg-card text-left transition-all duration-200 hover:border-border hover:shadow-sm overflow-hidden"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        {product.category && (
          <span className="w-fit rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
            {product.category}
          </span>
        )}
        <p className="font-semibold text-foreground leading-snug">{product.name}</p>
        <p className="text-sm text-muted-foreground">{formatPrice(product.price, product.currency)}</p>
        <p className="mt-1.5 text-xs font-medium text-primary group-hover:underline">Ver producto →</p>
      </div>
    </button>
  )
}

// ── ProductModal ─────────────────────────────────────────────────────────────

function ProductModal({ product, onClose }: { product: MerchProduct; onClose: () => void }) {
  const allImages = product.images.length > 0 ? product.images : [product.image]
  const [activeImage, setActiveImage] = useState(() => product.image)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-background border border-border/60 shadow-xl overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-full bg-muted/80 p-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {/* Imagen */}
        <div className="relative h-64 w-full shrink-0 bg-muted/40 md:h-auto md:w-80">
          <Image
            src={activeImage}
            alt={product.name}
            fill
            sizes="320px"
            className="object-contain p-6"
          />
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {allImages.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    activeImage === img ? 'w-4 bg-primary' : 'w-1.5 bg-border'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 p-6 md:flex-1">
          {product.category && (
            <span className="w-fit rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {product.category}
            </span>
          )}
          <h2 className="text-xl font-bold text-foreground">{product.name}</h2>
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
          )}
          <p className="text-lg font-semibold text-foreground">
            {formatPrice(product.price, product.currency)}
          </p>
          <div className="flex items-center gap-2">
            <Package className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {product.stock > 0 ? `${product.stock} disponibles` : 'Consultar disponibilidad'}
            </span>
          </div>
          <a
            href={whatsappLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto"
          >
            <Button className="w-full gap-2">
              <ShoppingBag className="size-4" />
              Solicitar por WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function ProductSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border/60 overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MerchPage() {
  const [products, setProducts] = useState<MerchProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MerchProduct | null>(null)

  useEffect(() => {
    getMerchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Merch TEDUCA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lleva TEDUCA contigo. Productos oficiales de edición limitada.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="font-medium">Aún no hay productos disponibles</p>
          <p className="mt-1 text-sm">Cuando haya productos nuevos aparecerán aquí.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
