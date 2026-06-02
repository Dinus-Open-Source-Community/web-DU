import { useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthTokenExpired, useAuth } from './auth-provider'
import type { UserRole } from '../lib/types/user'
import { ROUTES } from '@/lib/routes'

const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  student: `${ROUTES.student.dashboard}`,
  mentor: `${ROUTES.mentor.dashboard}`,
  admin: `${ROUTES.admin.dashboard}`,
}

type RouteGuardProps = {
  children: ReactNode
  allowedRoles?: UserRole[]
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const location = useLocation()
  const { isLoading, token, role, signOut } = useAuth()
  const tokenExpired = isAuthTokenExpired(token)

  useEffect(() => {
    if (token && tokenExpired) signOut()
  }, [signOut, token, tokenExpired])

  if (isLoading) return null

  if (!token || tokenExpired) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (!role || !allowedRoles?.includes(role)) {
    return <Navigate to={role ? ROLE_DASHBOARD_PATH[role] : '/auth/login'} replace />
  }

  return children
}
