import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE = 'teduca_auth'

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/mentor',
  '/discover',
  '/courses',
  '/favorites',
  '/reservations',
  '/messages',
  '/profile',
  '/settings',
  '/assignments',
  '/onboarding',
  '/notifications',
  '/achievements',
  '/for-you',
  '/orbits',
  '/participate',
  '/community',
  '/teacher',
  '/become-teacher',
  '/evaluation',
  '/announcements',
  '/merch',
]

const AUTH_ONLY_PREFIXES = ['/login', '/register']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has(AUTH_COOKIE)

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  const isAuthOnly = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p))
  if (isAuthOnly && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()',
  )
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains',
  )
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000') + " " + (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/^https?/, (p) => p === 'https' ? 'wss' : 'ws') + " https://qlqqpeisizzmugpubzmk.supabase.co",
      "frame-src https://accounts.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  )

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
