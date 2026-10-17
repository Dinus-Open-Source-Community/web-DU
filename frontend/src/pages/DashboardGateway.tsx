import { Suspense, lazy } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import { PageSkeleton } from '@/components/shared/PageSkeleton'
import {
  DASHBOARD_PATH,
  dashboardShellRoleForUser,
} from '@/lib/dashboard-route'
import { useAuth } from '@/providers/auth-provider'

const AdminDashboard = lazy(() => import('./admin/Dashboard.tsx'))
const MentorDashboard = lazy(() => import('./mentor/Dashboard.tsx'))
const StudentDashboard = lazy(() => import('./student/Dashboard.tsx'))

const dashboardFallback = (
  <PageSkeleton
    message="Memuat dashboard..."
    className="min-h-dvh justify-center px-4 sm:px-6 lg:px-8"
  />
)

export default function DashboardGateway() {
  const { role } = useAuth()
  const [searchParams] = useSearchParams()

  if (!role) {
    return <Navigate to="/auth/login" replace />
  }

  if (searchParams.has('role')) {
    return <Navigate to={DASHBOARD_PATH} replace />
  }

  const shellRole = dashboardShellRoleForUser(role)

  const DashboardView =
    shellRole === 'admin'
      ? AdminDashboard
      : shellRole === 'mentor'
        ? MentorDashboard
        : StudentDashboard

  return (
    <Suspense fallback={dashboardFallback}>
      <DashboardView />
    </Suspense>
  )
}
