import Cookies from 'js-cookie'

export type UserRole = 'student' | 'mentor' | 'admin'

export interface AuthUser {
  uid: string
  nama: string
  email: string
  role: UserRole
  avatar?: string
}

export const AUTH_COOKIE_TOKEN = 'du_access_token'
export const AUTH_COOKIE_USER = 'du_auth_user'
export const AUTH_COOKIE_ROLE = 'du_auth_role'

const DEFAULT_SESSION_DAYS = 1

const roleAlias: Record<string, UserRole> = {
  student: 'student',
  mentor: 'mentor',
  admin: 'admin',
}

export const ROLE_ROUTE_PREFIX: Record<UserRole, string> = {
  student: '/student',
  mentor: '/mentor',
  admin: '/admin',
}

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  student: '/student/dashboard',
  mentor: '/mentor/dashboard',
  admin: '/admin/dashboard',
}

const parseRole = (input: unknown): UserRole => {
  if (typeof input !== 'string') return 'student'
  const cleaned = input
    .toLowerCase()
    .replace(/_role$/, '')
    .trim()
  return roleAlias[cleaned] ?? 'student'
}

const emitAuthChange = () => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('du-auth-change'))
}

const toCookieDate = (expiresAt?: string) => {
  if (!expiresAt) {
    return new Date(Date.now() + DEFAULT_SESSION_DAYS * 24 * 60 * 60 * 1000)
  }

  const parsed = new Date(expiresAt)
  if (Number.isNaN(parsed.getTime())) {
    return new Date(Date.now() + DEFAULT_SESSION_DAYS * 24 * 60 * 60 * 1000)
  }

  return parsed
}

export function setAuthToken(token: string, expiresAt?: string) {
  Cookies.set(AUTH_COOKIE_TOKEN, token, {
    expires: toCookieDate(expiresAt),
    sameSite: 'lax',
  })
  emitAuthChange()
}

export function getAuthToken(): string | null {
  return Cookies.get(AUTH_COOKIE_TOKEN) ?? null
}

export function clearAuthSession() {
  Cookies.remove(AUTH_COOKIE_TOKEN)
  Cookies.remove(AUTH_COOKIE_USER)
  Cookies.remove(AUTH_COOKIE_ROLE)
  emitAuthChange()
}

export function normalizeAuthUser(value: unknown): AuthUser | null {
  if (typeof value !== 'object' || value === null) return null

  const candidate = value as Record<string, unknown>
  const uid = candidate.uid
  const name = candidate.name
  const email = candidate.email
  const role = candidate.role
  const avatarUrl = candidate.avatar_url ?? candidate.avatar

  if (typeof uid !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
    return null
  }

  return {
    uid,
    nama: name,
    email,
    role: parseRole(role),
    avatar: typeof avatarUrl === 'string' ? avatarUrl : undefined,
  }
}

export function setAuthUser(user: AuthUser) {
  Cookies.set(AUTH_COOKIE_USER, JSON.stringify(user), {
    expires: DEFAULT_SESSION_DAYS,
    sameSite: 'lax',
  })
  Cookies.set(AUTH_COOKIE_ROLE, user.role, {
    expires: DEFAULT_SESSION_DAYS,
    sameSite: 'lax',
  })
  emitAuthChange()
}

export function getAuthUser(): AuthUser | null {
  const raw = Cookies.get(AUTH_COOKIE_USER)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return normalizeAuthUser(parsed)
  } catch {
    return null
  }
}

export function getAuthRole(): UserRole | null {
  const role = Cookies.get(AUTH_COOKIE_ROLE)
  return role ? parseRole(role) : null
}

export function toSidebarUser(user: AuthUser): { name: string; email: string; role: string; avatar?: string } {
  return {
    name: user.nama,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  }
}
