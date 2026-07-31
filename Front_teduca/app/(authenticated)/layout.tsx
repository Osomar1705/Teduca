import { DashboardShell } from '@/components/layout/DashboardShell'

/**
 * Layout del área autenticada: shell del producto (sidebar + topbar).
 *
 * NOTA: la protección de sesión se implementará con Auth.js (Google OAuth) +
 * middleware en la fase de autenticación. Mientras trabajamos frontend-first
 * con datos mock, el shell queda accesible para poder iterar la UI.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
