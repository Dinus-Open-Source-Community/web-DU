import Cookies from 'js-cookie'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getAuthenticatedUser, loginWithEmail, registerWithEmail, startGoogleOAuth } from '../services/auth'
import { AUTH_COOKIE_TOKEN, getApiAuthToken, setApiAuthToken } from '../services/axios'
import type { IAuthResult, IAuthSessionUser, ILoginPayload, IRegisterPayload } from '../lib/types/auth'
import type { IUserData, UserRole } from '../lib/types/user'
import type { JwtPayload } from '@/lib/types/auth/jwt-payload'
import { ROUTES } from '@/lib/routes'
import { useResolvedAuthProfile } from '@/hooks/files/use-resolved-auth-profile'

export const AUTH_COOKIE_USER = 'du_auth_user'
export const AUTH_COOKIE_EXPIRES_AT = 'du_auth_expires_at'

const DEFAULT_SESSION_DAYS = 1
const AUTH_CHANGE_EVENT = 'du-auth-change'

const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  student: `${ROUTES.student.dashboard}`,
  mentor: `${ROUTES.mentor.dashboard}`,
  admin: `${ROUTES.admin.dashboard}`,
}

interface AuthContextValue {
  user: IAuthSessionUser | null
  role: UserRole | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isResolvingImages: boolean
  profile: IUserData | null
  signIn: (payload: ILoginPayload) => Promise<IAuthResult>
  signUp: (payload: IRegisterPayload) => Promise<IAuthResult>
  signInWithToken: (token: string, expiresAt?: string) => Promise<IAuthResult>
  signOut: () => void
  refreshUser: () => Promise<IAuthSessionUser | null>
  refreshProfile: () => Promise<IUserData | null>
  startGoogleOAuth: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const emitAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
}

const getTokenExpires = (expiresAt?: string) => {
  if (!expiresAt) return DEFAULT_SESSION_DAYS

  const parsedDate = new Date(expiresAt)
  return Number.isNaN(parsedDate.getTime()) ? DEFAULT_SESSION_DAYS : parsedDate
}

const normalizeRole = (role: string): UserRole => {
  if (role === 'super_admin') return 'admin'
  if (role === 'admin' || role === 'mentor' || role === 'student') return role
  return 'student'
}

const toSessionUser = (user: IUserData): IAuthSessionUser => ({
  uid: user.uid,
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role),
  avatar_url: user.avatar_url,
})

const getDashboardPath = (role?: UserRole | null) => (role ? ROLE_DASHBOARD_PATH[role] : '/auth/login')

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(window.atob(normalizedPayload)) as JwtPayload
  } catch {
    return null
  }
}

export function isAuthTokenExpired(token: string | null = getAuthToken()) {
  if (!token) return true

  const cookieExpiresAt = Cookies.get(AUTH_COOKIE_EXPIRES_AT)
  if (cookieExpiresAt) {
    const expiresAtTime = new Date(cookieExpiresAt).getTime()
    if (!Number.isNaN(expiresAtTime)) return expiresAtTime <= Date.now()
  }

  const jwtExpiresAt = decodeJwtPayload(token)?.exp
  if (typeof jwtExpiresAt === 'number') return jwtExpiresAt * 1000 <= Date.now()

  return false
}

function setAuthToken(token: string, expiresAt?: string) {
  const cookieExpires = getTokenExpires(expiresAt)
  Cookies.set(AUTH_COOKIE_TOKEN, token, {
    expires: cookieExpires,
    sameSite: 'strict',
    secure: window.location.protocol === 'https:',
  })
  if (expiresAt) {
    Cookies.set(AUTH_COOKIE_EXPIRES_AT, expiresAt, {
      expires: cookieExpires,
      sameSite: 'strict',
      secure: window.location.protocol === 'https:',
    })
  }
  setApiAuthToken(token)
  emitAuthChange()
}

function getAuthToken() {
  return getApiAuthToken()
}

function setAuthUser(user: IAuthSessionUser) {
  Cookies.set(AUTH_COOKIE_USER, JSON.stringify(user), {
    expires: DEFAULT_SESSION_DAYS,
    sameSite: 'strict',
    secure: window.location.protocol === 'https:',
  })
  emitAuthChange()
}

function getAuthUser(): IAuthSessionUser | null {
  const rawUser = Cookies.get(AUTH_COOKIE_USER)
  if (!rawUser) return null

  try {
    const parsedUser = JSON.parse(rawUser) as IAuthSessionUser
    return {
      ...parsedUser,
      role: normalizeRole(parsedUser.role),
    }
  } catch {
    return null
  }
}

function clearAuthSession() {
  Cookies.remove(AUTH_COOKIE_TOKEN)
  Cookies.remove(AUTH_COOKIE_USER)
  Cookies.remove(AUTH_COOKIE_EXPIRES_AT)
  setApiAuthToken(null)
  emitAuthChange()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IAuthSessionUser | null>(() => getAuthUser())
  const [rawProfile, setRawProfile] = useState<IUserData | null>(null)
  const { profile: resolvedProfile, isResolvingImages } = useResolvedAuthProfile(rawProfile)
  const [token, setToken] = useState<string | null>(() => getAuthToken())
  const [isLoading, setIsLoading] = useState(true)

  const applySession = useCallback((sessionUser: IAuthSessionUser, fullProfile?: IUserData): IAuthResult => {
    setAuthUser(sessionUser)
    setUser(sessionUser)
    if (fullProfile) setRawProfile(fullProfile)
    return {
      user: sessionUser,
      redirectPath: getDashboardPath(sessionUser.role),
    }
  }, [])

  const signOut = useCallback(() => {
    clearAuthSession()
    setUser(null)
    setRawProfile(null)
    setToken(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const currentToken = getAuthToken()
    setToken(currentToken)

    if (!currentToken || isAuthTokenExpired(currentToken)) {
      setUser(null)
      setRawProfile(null)
      if (currentToken) clearAuthSession()
      return null
    }

    try {
      const nextProfile = await getAuthenticatedUser()
      const sessionUser = toSessionUser(nextProfile)
      applySession(sessionUser, nextProfile)
      return nextProfile
    } catch {
      signOut()
      return null
    }
  }, [applySession, signOut])

  const refreshUser = useCallback(async () => {
    const nextProfile = await refreshProfile()
    return nextProfile ? toSessionUser(nextProfile) : null
  }, [refreshProfile])

  const signInWithToken = useCallback(
    async (accessToken: string, expiresAt?: string) => {
      setAuthToken(accessToken, expiresAt)
      setToken(accessToken)

      const nextProfile = await getAuthenticatedUser()
      return applySession(toSessionUser(nextProfile), nextProfile)
    },
    [applySession],
  )

  const signIn = useCallback(
    async (payload: ILoginPayload) => {
      const auth = await loginWithEmail(payload)
      return signInWithToken(auth.token, auth.expires_at)
    },
    [signInWithToken],
  )

  const signUp = useCallback(
    async ({ name, email, password }: IRegisterPayload) => {
      const payload = { name, email, password }
      const auth = await registerWithEmail(payload)
      return signInWithToken(auth.token, auth.expires_at)
    },
    [signInWithToken],
  )

  useEffect(() => {
    setApiAuthToken(getAuthToken())
    void refreshUser().finally(() => setIsLoading(false))

    const syncAuthState = () => {
      const currentToken = getAuthToken()
      setApiAuthToken(currentToken)
      setUser(getAuthUser())
      if (!currentToken) setRawProfile(null)
      setToken(currentToken)
    }

    window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState)
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState)
  }, [refreshUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      token,
      profile: resolvedProfile,
      isAuthenticated: Boolean(token && user),
      isLoading,
      isResolvingImages,
      signIn,
      signUp,
      signInWithToken,
      signOut,
      refreshUser,
      refreshProfile,
      startGoogleOAuth,
    }),
    [
      isLoading,
      isResolvingImages,
      refreshProfile,
      refreshUser,
      resolvedProfile,
      signIn,
      signInWithToken,
      signOut,
      signUp,
      token,
      user,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
