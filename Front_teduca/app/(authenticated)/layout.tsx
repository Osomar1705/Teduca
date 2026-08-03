import { DashboardShell } from '@/components/layout/DashboardShell'

/**
 * Layout del área autenticada: shell del producto (sidebar + topbar).
 *


 * con datos mock, el shell queda accesible para poder iterar la UI.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
