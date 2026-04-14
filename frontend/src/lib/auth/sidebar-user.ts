/**
 * Identitas pengguna untuk sidebar / profil.
 * Diganti sumbernya (Auth.js, session API, atau konteks React) ketika backend autentikasi terhubung.
 *
 * Opsi env publik (opsional, di-build ke bundle):
 * - `NEXT_PUBLIC_SESSION_NAME`, `NEXT_PUBLIC_SESSION_EMAIL`, `NEXT_PUBLIC_SESSION_ROLE`, `NEXT_PUBLIC_SESSION_AVATAR`
 */
export type SidebarUser = {
  name: string
  email: string
  role: string
  avatar?: string
}

export function getSidebarUser(): SidebarUser {
  const name = process.env.NEXT_PUBLIC_SESSION_NAME?.trim()
  const email = process.env.NEXT_PUBLIC_SESSION_EMAIL?.trim()
  if (name || email) {
    return {
      name: name || 'Pengguna',
      email: email || '',
      role: process.env.NEXT_PUBLIC_SESSION_ROLE?.trim() || 'User',
      avatar: process.env.NEXT_PUBLIC_SESSION_AVATAR?.trim() || undefined,
    }
  }
  return {
    name: 'Pengguna',
    email: '',
    role: 'User',
    avatar: undefined,
  }
}
