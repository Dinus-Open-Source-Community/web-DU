'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { beginGoogleOAuth, fetchSelfProfile, loginWithPassword, registerWithPassword } from '@/lib/auth/api'
import { AUTH_COOKIE_ROLE, AUTH_COOKIE_TOKEN, ROLE_DASHBOARD_PATH, clearAuthSession, getAuthToken, getAuthUser, setAuthToken, setAuthUser, type AuthUser, type UserRole } from '@/lib/auth/session'

type SignInResult = { user: AuthUser; redirectPath: string }

type AuthContextValue = {
  user: AuthUser | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (name: string, email: string, password: string) => Promise<SignInResult>
  signInWithToken: (token: string, expiresAt?: string) => Promise<SignInResult>
  signOut: () => void
  refreshProfile: () => Promise<AuthUser | null>
  startGoogleOAuth: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const dashboardPathFor = (role: UserRole | undefined | null) => (role && ROLE_DASHBOARD_PATH[role]) || '/auth/login'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const applyUser = useCallback((profile: AuthUser): SignInResult => {
    setAuthUser(profile)
    setUser(profile)
    return { user: profile, redirectPath: dashboardPathFor(profile.role) }
  }, [])

  const clear = useCallback(() => {
    clearAuthSession()
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const token = getAuthToken()
    if (!token) {
      setUser(null)
      return null
    }

    try {
      const profile = await fetchSelfProfile(token)
      applyUser(profile)
      return profile
    } catch {
      clear()
      return null
    }
  }, [applyUser, clear])

  useEffect(() => {
    const token = getAuthToken()
    setUser(getAuthUser())

    if (!token) {
      setIsLoading(false)
      return
    }

    void refreshProfile().finally(() => setIsLoading(false))

    const sync = () => setUser(getAuthUser())
    window.addEventListener('du-auth-change', sync)
    return () => window.removeEventListener('du-auth-change', sync)
  }, [refreshProfile])

  const signInWithToken = useCallback(
    async (token: string, expiresAt?: string) => {
      setAuthToken(token, expiresAt)
      const profile = await fetchSelfProfile(token)
      return applyUser(profile)
    },
    [applyUser],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      const auth = await loginWithPassword(email, password)
      return signInWithToken(auth.token, auth.expires_at)
    },
    [signInWithToken],
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const auth = await registerWithPassword(name, email, password)
      return signInWithToken(auth.token, auth.expires_at)
    },
    [signInWithToken],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isLoading,
      signIn,
      signUp,
      signInWithToken,
      signOut: clear,
      refreshProfile,
      startGoogleOAuth: beginGoogleOAuth,
    }),
    [clear, isLoading, refreshProfile, signIn, signInWithToken, signUp, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Re-export supaya konsumer cukup import satu modul saja untuk kebutuhan auth dasar.
export type { AuthUser, UserRole }
export { AUTH_COOKIE_ROLE, AUTH_COOKIE_TOKEN }
