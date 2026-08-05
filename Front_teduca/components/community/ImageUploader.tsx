'use client'

/**
 * ImageUploader — adjunta imágenes a una publicación.
 *
 * Flujo:
 *   1. Selección (label nativo o drag & drop) → validación → preview local.
 *   2. Subida a Supabase Storage vía URL pre-firmada (uploadLargeFile).
 *   3. Emite PostImage[] al padre vía onChange; isUploading bloquea Publicar.
 *
 * FIX vs versión anterior: NO usa fileRef.current?.click(). El trigger de
 * selección siempre pasa por un <label htmlFor> nativo — única técnica
 * garantizada cross-browser (Chrome, Safari, Firefox, móvil).
 *
 * Estado gestionado internamente con useRef para evitar closures obsoletos
 * en callbacks de subida asíncrona.
 */

import { useCallback, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ImageIcon, Loader2, Plus, RefreshCw, Trash2, Upload, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadLargeFile } from '@/lib/storage/service'

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface PostImage {
  uid: string
  file: File
  previewUrl: string
  width: number
  height: number
  sizeBytes: number
  mimeType: string
  status: 'uploading' | 'done' | 'error'
  progress: number
  /** URL pública Supabase (status === 'done'). */
  url?: string
  /** Ruta en bucket para guardar junto al post en BD. */
  storagePath?: string
  error?: string
}

export interface ImageUploaderProps {
  onChange: (images: PostImage[]) => void
  maxImages?: number
  maxSizeMb?: number
}

// ── Constantes ─────────────────────────────────────────────────────────────

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const
const ALLOWED_ACCEPT = ALLOWED_TYPES.join(',')
const ALLOWED_LABEL  = 'JPG, JPEG, PNG, WEBP'
const DEFAULT_MAX_MB = 10
const DEFAULT_MAX_N  = 4

// ── Helpers ────────────────────────────────────────────────────────────────

function makeUid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function readPreview(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload  = (e) => res(e.target!.result as string)
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

function readDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((res) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload  = () => { res({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = () => { res({ width: 0, height: 0 }); URL.revokeObjectURL(url) }
    img.src = url
  })
}

// ── Componente ─────────────────────────────────────────────────────────────

export function ImageUploader({
  onChange,
  maxImages = DEFAULT_MAX_N,
  maxSizeMb = DEFAULT_MAX_MB,
}: ImageUploaderProps) {
  const inputId      = useId()
  const [dragging, setDragging] = useState(false)
  const dragCounter  = useRef(0)

  // Estado interno como ref para evitar closures obsoletos en callbacks async
  const imagesRef    = useRef<PostImage[]>([])
  const [, forceRender] = useState(0)

  function setImages(updater: (prev: PostImage[]) => PostImage[]) {
    imagesRef.current = updater(imagesRef.current)
    forceRender((n) => n + 1)
    onChange(imagesRef.current)
  }

  const images = imagesRef.current

  // ── Validación ──────────────────────────────────────────────────────────

  function validate(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
      return `Formato no permitido. Usa ${ALLOWED_LABEL}.`
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      return `El archivo supera el límite de ${maxSizeMb} MB (${formatSize(file.size)}).`
    }
    return null
  }

  // ── Subida a Supabase ───────────────────────────────────────────────────

  async function uploadToSupabase(imageUid: string, file: File) {
    try {
      const asset = await uploadLargeFile(file, {
        category:      'community',
        access_level:  'public',
        display_name:  file.name,
        extra_metadata: { source: 'community_post' },
        onProgress: (pct) => {
          setImages((prev) =>
            prev.map((img) => img.uid === imageUid ? { ...img, progress: pct } : img)
          )
        },
      })

      setImages((prev) =>
        prev.map((img) =>
          img.uid === imageUid
            ? {
                ...img,
                status: 'done' as const,
                progress: 100,
                storagePath: asset.storage_path,
                url: (asset as unknown as Record<string, unknown>).url as string | undefined ?? img.previewUrl,
              }
            : img
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido al subir'
      setImages((prev) =>
        prev.map((img) =>
          img.uid === imageUid
            ? { ...img, status: 'error' as const, progress: 0, error: message }
            : img
        )
      )
    }
  }

  // ── Procesar archivos seleccionados ─────────────────────────────────────

  async function processFiles(rawFiles: File[]) {
    const available = maxImages - images.length
    if (available <= 0) return
    const batch = rawFiles.slice(0, available)

    for (const file of batch) {
      const validationError = validate(file)
      const imageUid = makeUid()

      // Slot inicial (aparece inmediatamente)
      const slot: PostImage = {
        uid:       imageUid,
        file,
        previewUrl: '',
        width:     0,
        height:    0,
        sizeBytes: file.size,
        mimeType:  file.type,
        status:    validationError ? 'error' : 'uploading',
        progress:  0,
        error:     validationError ?? undefined,
      }

      setImages((prev) => [...prev, slot])

      if (validationError) continue

      // Preview + dimensiones en paralelo (no bloqueamos el loop)
      Promise.all([readPreview(file), readDimensions(file)]).then(([previewUrl, dims]) => {
        setImages((prev) =>
          prev.map((img) =>
            img.uid === imageUid
              ? { ...img, previewUrl, width: dims.width, height: dims.height }
              : img
          )
        )
      })

      // Subida
      uploadToSupabase(imageUid, file)
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length) processFiles(files)
    e.target.value = '' // reset para re-selección del mismo archivo
  }

  function handleRemove(uid: string) {
    setImages((prev) => prev.filter((img) => img.uid !== uid))
  }

  function handleRetry(img: PostImage) {
    setImages((prev) =>
      prev.map((i) =>
        i.uid === img.uid ? { ...i, status: 'uploading', progress: 0, error: undefined } : i
      )
    )
    uploadToSupabase(img.uid, img.file)
  }

  // ── Drag & Drop ─────────────────────────────────────────────────────────

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current++
    if (dragCounter.current === 1) setDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setDragging(false)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    dragCounter.current = 0
    setDragging(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length) processFiles(files)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length, maxImages])

  const canAddMore = images.length < maxImages

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      {/*
        INPUT NATIVO — siempre fuera del flujo visual.
        El trigger se hace exclusivamente vía <label htmlFor={inputId}>,
        nunca mediante fileRef.current?.click() (comportamiento inconsistente
        en Safari y Firefox cuando el input tiene display:none o está dentro
        de un contenedor con overflow:hidden).
      */}
      <input
        id={inputId}
        type="file"
        accept={ALLOWED_ACCEPT}
        multiple
        className="sr-only"
        onChange={handleInputChange}
      />

      {/* Zona de drop vacía */}
      {images.length === 0 && (
        <label
          htmlFor={inputId}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors select-none',
            dragging
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/30 hover:text-foreground'
          )}
        >
          <div className={cn(
            'flex size-10 items-center justify-center rounded-full transition-colors',
            dragging ? 'bg-primary/10' : 'bg-muted'
          )}>
            {dragging ? <Upload className="size-5 text-primary" /> : <ImageIcon className="size-5" />}
          </div>
          <div>
            <p className="text-sm font-medium">
              {dragging ? 'Suelta aquí para agregar' : 'Arrastra imágenes o haz clic para elegir'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {ALLOWED_LABEL} · máx. {maxSizeMb} MB por imagen · hasta {maxImages} fotos
            </p>
          </div>
        </label>
      )}

      {/* Grid de previews */}
      {images.length > 0 && (
        <div
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={cn(
            'grid gap-2 transition-colors',
            images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          <AnimatePresence mode="popLayout">
            {images.map((img) => (
              <motion.div
                key={img.uid}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="group relative overflow-hidden rounded-xl border border-border bg-muted"
              >
                {/* Imagen */}
                <div className="aspect-video w-full overflow-hidden">
                  {img.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.previewUrl}
                      alt={img.file.name}
                      className={cn(
                        'h-full w-full object-cover transition-opacity',
                        img.status === 'error' && 'opacity-30 grayscale'
                      )}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="size-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Overlay subiendo */}
                {img.status === 'uploading' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/55 backdrop-blur-[2px]">
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <div className="w-20">
                      <div className="h-1 overflow-hidden rounded-full bg-border">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          animate={{ width: `${img.progress}%` }}
                          transition={{ duration: 0.25 }}
                        />
                      </div>
                      <p className="mt-1 text-center text-[10px] text-muted-foreground">
                        {img.progress < 100 ? `${img.progress}%` : 'Confirmando…'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Overlay error */}
                {img.status === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 p-3 text-center backdrop-blur-[2px]">
                    <div className="flex size-7 items-center justify-center rounded-full bg-destructive/10">
                      <X className="size-4 text-destructive" />
                    </div>
                    <p className="text-[11px] leading-snug text-destructive line-clamp-3">
                      {img.error}
                    </p>
                    {/* Mostrar Reintentar solo si es error de red (no de validación) */}
                    {img.error && !img.error.includes('Formato') && !img.error.includes('supera') && (
                      <button
                        type="button"
                        onClick={() => handleRetry(img)}
                        className="mt-1 flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        <RefreshCw className="size-3" /> Reintentar
                      </button>
                    )}
                  </div>
                )}

                {/* Badge subida completa */}
                {img.status === 'done' && (
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                    ✓ Lista
                  </div>
                )}

                {/* Info hover */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-2 transition-transform group-hover:translate-y-0">
                  <p className="truncate text-[10px] font-medium text-white">{img.file.name}</p>
                  <p className="text-[9px] text-white/60">
                    {formatSize(img.sizeBytes)}{img.width > 0 ? ` · ${img.width}×${img.height}` : ''}
                  </p>
                </div>

                {/* Botón eliminar */}
                <button
                  type="button"
                  onClick={() => handleRemove(img.uid)}
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/75"
                >
                  <Trash2 className="size-3" />
                </button>
              </motion.div>
            ))}

            {/* Celda "añadir más" */}
            {canAddMore && images.length > 0 && (
              <motion.label
                key="add-more"
                htmlFor={inputId}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'flex aspect-video w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-colors',
                  dragging
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/30 hover:text-primary'
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  <Plus className="size-5" />
                  <span className="text-[11px] font-medium">Agregar</span>
                </div>
              </motion.label>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

/**
 * Botón compacto para usar en el footer del modal.
 * Renderiza un <label> que apunta al mismo inputId del ImageUploader.
 * Pasa el inputId como prop para mantener la conexión.
 */
export function ImageUploaderTrigger({
  inputId,
  count,
  className,
}: {
  inputId: string
  count: number
  className?: string
}) {
  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors select-none',
        count > 0
          ? 'text-primary bg-primary/8 hover:bg-primary/12'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        className
      )}
    >
      <ImageIcon className="size-3.5" />
      {count > 0 ? `${count} foto${count > 1 ? 's' : ''}` : 'Imagen'}
    </label>
  )
}
