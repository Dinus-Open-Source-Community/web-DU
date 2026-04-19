const GUEST_SESSION_KEY = 'du_guest_session_v1'

export function isGuestSessionActive(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(GUEST_SESSION_KEY) === '1'
}

export function setGuestSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(GUEST_SESSION_KEY, '1')
  window.dispatchEvent(new Event('du-guest-auth'))
}

export function clearGuestSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(GUEST_SESSION_KEY)
  window.dispatchEvent(new Event('du-guest-auth'))
}
