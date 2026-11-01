import { Suspense, lazy } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import { DashboardRouteFallback } from '@/components/dashboard/DashboardRouteFallback'
import {
  DASHBOARD_PATH,
  dashboardShellRoleForUser,
} from '@/lib/dashboard-route'
import { useAuth } from '@/providers/auth-provider'

const AdminDashboard = lazy(() => import('./admin/Dashboard.tsx'))
const MentorDashboard = lazy(() => import('./mentor/Dashboard.tsx'))
const StudentDashboard = lazy(() => import('./student/Dashboard.tsx'))

/**
 * Fallback sama dengan fallback route `/dashboard` di App: admin/super admin
 * melihat skeleton dasbor (chrome + KPI + kartu analitik), role lain memakai
 * skeleton generik. Dipakai juga saat chunk dasbor per-role masih diunduh.
 */
const dashboardFallback = <DashboardRouteFallback />

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
