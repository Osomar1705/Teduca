import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware de Next 16 (archivo `proxy`).
 *
 * Protege el área privada usando la cookie no sensible `teduca_auth` que el
 * cliente marca al guardar los JWT del backend (localStorage no es accesible
 * desde el edge). La validación real del token la hace FastAPI en cada request.
 */

// Mismo nombre que AUTH_COOKIE en lib/auth-tokens.ts (módulo 'use client',
// no importable desde el edge).
const AUTH_COOKIE = 'teduca_auth'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/discover',
  '/courses',
  '/favorites',
  '/reservations',
  '/messages',
  '/profile',
  '/settings',
  '/assignments',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))

  if (isProtected && !request.cookies.has(AUTH_COOKIE)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
