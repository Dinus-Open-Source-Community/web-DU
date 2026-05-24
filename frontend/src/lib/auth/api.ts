import type { AuthUser } from '@/lib/auth/session'
import { getAuthRole, getAuthUser, normalizeAuthUser, setAuthUser } from '@/lib/auth/session'
import type { UserRole } from '@/lib/auth/session'
import { dummyUidForRole } from '@/lib/auth/dummy-identity'

type LoginPayload = {
  token: string
  expires_at?: string
  user?: AuthUser
}

function buildDummyUser(email: string, displayName?: string): AuthUser {
  const role = (getAuthRole() ?? 'admin') as UserRole
  return {
    uid: dummyUidForRole(role),
    nama: displayName ?? email.split('@')[0] ?? 'Pengguna',
    email,
    role,
    avatar: undefined,
  }
}

/** Login lokal tanpa backend — penyimpanan via cookie (`setAuthUser` / token dummy). */
export async function loginWithPassword(email: string, _password: string): Promise<LoginPayload> {
  const user = buildDummyUser(email)
  setAuthUser(user)
  return {
    token: 'dummy-access-token',
    expires_at: undefined,
    user,
  }
}

/** Register lokal tanpa backend. */
export async function registerWithPassword(name: string, email: string, _password: string): Promise<LoginPayload> {
  const role = (getAuthRole() ?? 'admin') as UserRole
  const user: AuthUser = { uid: dummyUidForRole(role), nama: name, email, role }
  setAuthUser(user)
  return {
    token: 'dummy-access-token',
    expires_at: undefined,
    user,
  }
}

/** Profil dari sesi cookie — tidak memanggil jaringan. */
export async function fetchSelfProfile(_token: string): Promise<AuthUser> {
  const existing = getAuthUser()
  if (existing) return existing

  const role = (getAuthRole() ?? 'admin') as UserRole
  const synthetic: Record<string, unknown> = {
    uid: dummyUidForRole(role),
    name: 'Pengguna',
    email: 'user@dummy.local',
    role,
    avatar_url: '',
  }

  const parsed = normalizeAuthUser(synthetic)
  if (!parsed) {
    throw new Error('Sesi dummy tidak valid')
  }
  setAuthUser(parsed)
  return parsed
}

export function beginGoogleOAuth() {
  if (typeof window === 'undefined') return
  // eslint-disable-next-line no-alert
  window.alert('OAuth dinonaktifkan pada mode dummy (tanpa API).')
}
