/**
 * Single source of truth untuk user aktif (dummy) di aplikasi.
 * Diimport oleh:
 * - `hooks/useUser.ts` (Client Components)
 * - Server Components lewat `getCurrentUser()`
 * - `middleware.ts` di edge runtime
 *
 * Untuk ganti role yang aktif saat development, cukup ubah `ACTIVE_USER_ID`
 * ke salah satu `id` yang terdaftar di `dummyUsers`.
 */

import { listUsers } from './repository'

export type UserRole = 'student' | 'mentor' | 'admin'

export interface DummyUser {
  id: string
  nama: string
  role: UserRole
  email: string
  avatar?: string
}

const DEV_USER_IDS = new Set(['usr-student-01', 'usr-mentor-01', 'usr-admin-01'])

export const dummyUsers: DummyUser[] = listUsers()
  .filter((u) => DEV_USER_IDS.has(u.id))
  .map((u) => ({
    id: u.id,
    nama: u.nama,
    role: u.role as UserRole,
    email: u.email,
    avatar: u.avatar,
  }))

/**
 * Ubah nilai ini untuk berganti role aktif saat development.
 * Harus cocok dengan salah satu `id` di `dummyUsers`.
 */
export const ACTIVE_USER_ID: string = 'usr-student-01'

export function getActiveUser(): DummyUser {
  const found = dummyUsers.find((u) => u.id === ACTIVE_USER_ID)
  return found ?? dummyUsers[0]
}

/** Alias eksplisit untuk dipakai di Server Components. */
export const getCurrentUser = getActiveUser

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

/** Adapter untuk komponen `Sidebar` yang memakai field `name` (bukan `nama`). */
export function toSidebarUser(user: DummyUser): {
  name: string
  email: string
  role: string
  avatar?: string
} {
  return {
    name: user.nama,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  }
}
