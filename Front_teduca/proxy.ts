import { NextRequest, NextResponse } from 'next/server'

const publicPaths = [
  '/login',
  '/register',
  '/',
]

const protectedPaths = [
  '/dashboard',
  '/courses',
  '/profile',
  '/settings',
]

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if route is protected
  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Presencia de sesión JWT (cookie marcada por el cliente al hacer login)
  const sessionToken = request.cookies.get('teduca_auth')?.value

  if (!sessionToken) {
    // Redirect to login if trying to access protected route
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
}
