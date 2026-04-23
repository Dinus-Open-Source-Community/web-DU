import { clearAuthSession, getAuthToken } from '@/lib/auth/session'

export function isGuestSessionActive(): boolean {
  return Boolean(getAuthToken())
}

export function setGuestSession(): void {
  // Intentionally left blank for backward compatibility.
  // Session must be created via login/register API response token.
}

export function clearGuestSession(): void {
  clearAuthSession()
}
