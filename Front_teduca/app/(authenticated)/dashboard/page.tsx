'use client'

import { StudentDashboard } from '@/components/dashboard/StudentDashboard'
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/constants'

function DashboardContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="text-center py-12">Cargando...</div>
  }

  return user?.role === UserRole.TEACHER ? (
    <TeacherDashboard />
  ) : (
    <StudentDashboard />
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}
