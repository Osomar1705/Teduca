import { NextResponse } from 'next/server'

/**
 * Middleware de Next 16 (archivo `proxy`).
 *
 * ⚠️ EN MIGRACIÓN: la protección de rutas se reimplementará con la sesión de
 * Auth.js (Google OAuth) en la fase de autenticación. Mientras trabajamos
 * frontend-first con datos mock, el área autenticada queda accesible para
 * poder iterar la UI del producto.
 *
 * Rutas del área privada (para reactivar el gate una vez cableado Auth.js):
 *   /dashboard /discover /courses /favorites /reservations /profile /settings
 */
export async function proxy() {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
}
