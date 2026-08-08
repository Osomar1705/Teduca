/**
 * Genera el análisis del alumno (fortalezas, áreas por mejorar y
 * recomendación del día) que se muestra en el dashboard.
 *
 * A diferencia de `/api/mentor`, acá no hay streaming: se pide una respuesta
 * corta en JSON y se valida antes de devolverla, porque alimenta una UI con
 * forma fija.
 */

import { NextRequest } from 'next/server'

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free'

const RECOMMENDATION_TYPES = ['mentoría', 'curso', 'comunidad', 'estudio'] as const

interface Insights {
  strengths: string[]
  areas: string[]
  patterns: string[]
  recommendation: {
    type: (typeof RECOMMENDATION_TYPES)[number]
    text: string
  }
}

const SCHEMA_INSTRUCTION = `Responde ÚNICAMENTE con un objeto JSON válido, sin
texto antes ni después, sin bloques de código. Estructura exacta:

{
  "strengths": ["máximo 3 fortalezas, 2-4 palabras cada una"],
  "areas": ["máximo 3 áreas por mejorar, 2-5 palabras cada una"],
  "patterns": ["máximo 3 observaciones, una frase cada una"],
  "recommendation": { "type": "mentoría|curso|comunidad|estudio", "text": "2 frases" }
}

Escribe en español neutro de Perú (tuteo: "tú tienes", "reserva"). Nunca uses
voseo ("tenés", "reservá"). No inventes datos que no te dieron. Si el alumno
recién empieza, dilo con naturalidad en vez de rellenar con elogios vacíos.`

/**
 * Extrae el primer objeto JSON completo del texto.
 *
 * No sirve buscar la última `}`: los modelos suelen añadir llaves sobrantes o
 * comentarios después del objeto, y eso rompe el parseo. Acá se cuentan llaves
 * balanceadas (ignorando las que estén dentro de un string) y se corta en
 * cuanto el objeto cierra.
 */
function extractJson(raw: string): unknown {
  const start = raw.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < raw.length; i++) {
    const char = raw[i]

    if (escaped) {
      escaped = false
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '"') {
      inString = !inString
      continue
    }
    if (inString) continue

    if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) {
        try {
          return JSON.parse(raw.slice(start, i + 1))
        } catch {
          return null
        }
      }
    }
  }

  return null
}

function toStringArray(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, limit)
}

function validate(parsed: unknown): Insights | null {
  if (!parsed || typeof parsed !== 'object') return null
  const raw = parsed as Record<string, unknown>

  const strengths = toStringArray(raw.strengths, 3)
  const areas = toStringArray(raw.areas, 3)
  const patterns = toStringArray(raw.patterns, 3)

  const recommendation = raw.recommendation as Record<string, unknown> | undefined
  const text =
    typeof recommendation?.text === 'string' ? recommendation.text.trim() : ''
  if (!text) return null

  const type = RECOMMENDATION_TYPES.includes(
    recommendation?.type as (typeof RECOMMENDATION_TYPES)[number],
  )
    ? (recommendation!.type as (typeof RECOMMENDATION_TYPES)[number])
    : 'estudio'

  if (strengths.length === 0 && areas.length === 0) return null

  return { strengths, areas, patterns, recommendation: { type, text } }
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Mentor no configurado.' }, { status: 503 })
  }

  let body: { summary?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Petición inválida.' }, { status: 400 })
  }

  if (!body.summary) {
    return Response.json({ error: 'Faltan datos del alumno.' }, { status: 400 })
  }

  try {
    const upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://teduca.vercel.app',
        'X-Title': 'TEDUCA Mentor',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        // Algunos modelos gastan buena parte del presupuesto en "razonamiento"
        // interno y truncan el JSON a la mitad. Acá no aporta nada, y además
        // duplica el tiempo de respuesta.
        reasoning: { enabled: false },
        max_tokens: 1500,
        messages: [
          { role: 'system', content: SCHEMA_INSTRUCTION },
          { role: 'user', content: body.summary },
        ],
      }),
    })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '')
      console.error('[insights] OpenRouter error', upstream.status, detail.slice(0, 300))
      return Response.json({ error: 'Servicio no disponible.' }, { status: 502 })
    }

    const data = await upstream.json()
    const content: string = data.choices?.[0]?.message?.content ?? ''
    const insights = validate(extractJson(content))

    if (!insights) {
      console.error('[insights] respuesta no parseable:', content.slice(0, 300))
      return Response.json({ error: 'Respuesta inválida del modelo.' }, { status: 502 })
    }

    return Response.json(insights)
  } catch (error) {
    console.error('[insights] fallo', error)
    return Response.json({ error: 'Servicio no disponible.' }, { status: 502 })
  }
}
