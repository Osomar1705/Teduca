/**
 * Endpoint del Mentor IA. Corre en el SERVIDOR de Vercel, nunca en el navegador.
 *
 * Es la razón por la que existe este archivo: la API key de OpenRouter se lee
 * de `process.env` y jamás llega al cliente. El navegador solo habla con
 * `/api/mentor`, que es del mismo origen (por eso no hace falta tocar el CSP
 * del middleware).
 *
 * La respuesta se devuelve en streaming para que el texto aparezca palabra por
 * palabra, como en ChatGPT.
 */

import { NextRequest } from 'next/server'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

/**
 * Modelo configurable por variable de entorno. Los modelos `:free` de
 * OpenRouter rotan y a veces se descontinúan; cambiarlo debe ser editar una
 * variable en Vercel, no tocar código.
 */
const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free'

/** Tope de mensajes de historial que se reenvían al modelo en cada turno. */
const HISTORY_LIMIT = 20

interface IncomingMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return Response.json(
      {
        error:
          'El mentor no está configurado todavía: falta la variable OPENROUTER_API_KEY.',
      },
      { status: 503 },
    )
  }

  let body: { systemPrompt?: string; messages?: IncomingMessage[] }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Petición inválida.' }, { status: 400 })
  }

  const { systemPrompt, messages } = body
  if (!systemPrompt || !Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'Faltan datos en la petición.' }, { status: 400 })
  }

  // Solo se reenvía la cola del historial: el contexto académico ya viaja
  // completo en el system prompt, así que el resto es coste sin valor.
  const trimmed = messages.slice(-HISTORY_LIMIT).map((m) => ({
    role: m.role,
    content: m.content,
  }))

  let upstream: Response
  try {
    upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        // OpenRouter usa estas dos cabeceras para atribuir el tráfico.
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://teduca.vercel.app',
        'X-Title': 'TEDUCA Mentor',
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        temperature: 0.6,
        // Sin esto, los modelos con razonamiento se quedan callados varios
        // segundos antes del primer token: el alumno ve el chat congelado.
        reasoning: { enabled: false },
        messages: [{ role: 'system', content: systemPrompt }, ...trimmed],
      }),
    })
  } catch {
    return Response.json(
      { error: 'No se pudo contactar al servicio de IA. Intenta de nuevo.' },
      { status: 502 },
    )
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '')
    // 429 es el caso frecuente con modelos gratuitos: se agotó la cuota diaria.
    const message =
      upstream.status === 429
        ? 'El mentor alcanzó su límite de uso por hoy. Intenta más tarde.'
        : 'El servicio de IA no está disponible en este momento.'
    console.error('[mentor] OpenRouter error', upstream.status, detail.slice(0, 300))
    return Response.json({ error: message }, { status: upstream.status })
  }

  // Se traduce el formato SSE de OpenRouter a texto plano, para que el cliente
  // solo tenga que ir concatenando lo que llega.
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader()
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          // La última línea puede estar cortada a la mitad: se guarda para
          // completarla con el siguiente trozo.
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine.startsWith('data:')) continue

            const payload = trimmedLine.slice(5).trim()
            if (payload === '[DONE]') {
              controller.close()
              return
            }

            try {
              const parsed = JSON.parse(payload)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) controller.enqueue(encoder.encode(delta))
            } catch {
              // Fragmento incompleto o comentario de keep-alive: se ignora.
            }
          }
        }
        controller.close()
      } catch (error) {
        console.error('[mentor] stream interrumpido', error)
        controller.close()
      } finally {
        reader.releaseLock()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}
