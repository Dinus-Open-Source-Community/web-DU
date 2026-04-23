import { API_ROUTES } from '@/lib/api/api'
import type { AuthUser } from '@/lib/auth/session'
import { normalizeAuthUser } from '@/lib/auth/session'

type Envelope<T> = {
  success?: boolean
  message?: string
  data?: T
  error?: unknown
}

type LoginPayload = {
  token: string
  expires_at?: string
  user: AuthUser
}

const parseErrorMessage = (payload: unknown, fallback: string) => {
  if (typeof payload !== 'object' || payload === null) return fallback
  const candidate = payload as { message?: unknown; error?: unknown }
  if (typeof candidate.message === 'string' && candidate.message.length > 0) return candidate.message
  if (typeof candidate.error === 'string' && candidate.error.length > 0) return candidate.error
  return fallback
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })

  const payload = (await response.json().catch(() => null)) as unknown

  if (!response.ok) {
    throw new Error(parseErrorMessage(payload, `Request failed (${response.status})`))
  }

  return payload as T
}

function extractToken(payload: Envelope<LoginPayload>): LoginPayload {
  const token = payload.data?.token
  if (!token) {
    throw new Error('Token tidak ditemukan pada response autentikasi')
  }

  const user = normalizeAuthUser(payload.data?.user)
  if (!user) {
    throw new Error('Data user tidak ditemukan pada response autentikasi')
  }

  return {
    token,
    expires_at: payload.data?.expires_at,
    user,
  }
}

export async function loginWithPassword(email: string, password: string): Promise<LoginPayload> {
  const payload = await requestJson<Envelope<LoginPayload>>(API_ROUTES.auth.login, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  return extractToken(payload)
}

export async function registerWithPassword(name: string, email: string, password: string): Promise<LoginPayload> {
  const payload = await requestJson<Envelope<LoginPayload>>(API_ROUTES.auth.register, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })

  return extractToken(payload)
}

export async function fetchSelfProfile(token: string): Promise<AuthUser> {
  const payload = await requestJson<Envelope<Record<string, unknown>>>(API_ROUTES.user.getSelfData, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const user = normalizeAuthUser(payload.data)
  if (!user) {
    throw new Error('Format profil user dari backend tidak valid')
  }

  return user
}

export function beginGoogleOAuth() {
  if (typeof window === 'undefined') return
  const callbackUrl = `${window.location.origin}/auth/oauth/callback`
  const oauthUrl = new URL(API_ROUTES.auth.oauth.googleLogin)
  oauthUrl.searchParams.set('frontend_callback', callbackUrl)
  window.location.assign(oauthUrl.toString())
}
