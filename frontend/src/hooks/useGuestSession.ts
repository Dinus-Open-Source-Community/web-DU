'use client'

import { useAuth } from '@/providers/auth-provider'

export function useGuestSession() {
  const { isAuthenticated, signOut } = useAuth()

  return {
    isLoggedIn: isAuthenticated,
    logout: signOut,
  }
}
