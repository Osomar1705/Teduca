import { NextRequest, NextResponse } from 'next/server'

const AUTH_COOKIE  = 'teduca_auth'
const PUBLIC_PATHS = ['/', '/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has(AUTH_COOKIE)

  // Rutas públicas: redirigir al dashboard si ya tiene sesión
  if (PUBLIC_PATHS.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Rutas protegidas: redirigir al login si no hay sesión
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
}
