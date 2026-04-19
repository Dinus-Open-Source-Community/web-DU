'use client'

import { useCallback, useEffect, useState } from 'react'
import { clearGuestSession, isGuestSessionActive } from '@/lib/auth/guest-session'

export function useGuestSession() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const sync = () => setIsLoggedIn(isGuestSessionActive())
    sync()
    window.addEventListener('storage', sync)
    window.addEventListener('du-guest-auth', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('du-guest-auth', sync)
    }
  }, [])

  const logout = useCallback(() => {
    clearGuestSession()
    setIsLoggedIn(false)
  }, [])

  return { isLoggedIn, logout }
}
