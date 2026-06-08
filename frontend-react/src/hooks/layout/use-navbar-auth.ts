import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import type { NavbarAuthViewModel } from '@/lib/layout/navbar-auth-view-model'
import { ROUTES } from '@/lib/routes'
import type { UserRole } from '@/lib/types/user'
import { useAuth } from '@/providers/auth-provider'

export type { NavbarAuthViewModel } from '@/lib/layout/navbar-auth-view-model'

export function useNavbarAuth(): NavbarAuthViewModel {
  const navigate = useNavigate()
  const { isAuthenticated, profile, signOut, user } = useAuth()
  const sessionUser = profile ?? user

  const onSignOut = useCallback(() => {
    signOut()
    navigate(ROUTES.login)
  }, [navigate, signOut])

  return {
    isAuthenticated,
    userName: sessionUser?.name ?? 'User',
    userEmail: sessionUser?.email ?? '',
    userRole: (sessionUser?.role ?? 'student') as UserRole,
    userAvatar: sessionUser?.avatar_url ?? '',
    onSignOut,
  }
}

export function useAppTopNavbarAuth(): { onSignOut: () => void } {
  const { signOut } = useAuth()

  return {
    onSignOut: signOut,
  }
}
