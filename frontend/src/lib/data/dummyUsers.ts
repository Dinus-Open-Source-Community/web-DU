/**
 * Stub kompatibilitas tipe pengguna.
 *
 * Berkas ini sengaja kosong dari data dummy. Ia hanya menyediakan tipe dan fungsi
 * adapter agar kode lama yang masih mengimpor `DummyUser`, `UserRole`, `getActiveUser`,
 * atau `toSidebarUser` tetap dapat dikompilasi. Jangan tambahkan data mock di sini.
 */

import type { AuthUser, UserRole as AuthUserRole } from '@/lib/auth/session'

export type UserRole = AuthUserRole

export interface DummyUser {
  id: string
  nama: string
  email: string
  role: UserRole
  avatar?: string
}

const EMPTY_USER: DummyUser = {
  id: '',
  nama: '',
  email: '',
  role: 'student',
  avatar: undefined,
}

export function getActiveUser(): DummyUser {
  return EMPTY_USER
}

export function toSidebarUser(
  user: DummyUser | AuthUser | null | undefined,
): { name: string; email: string; role: string; avatar?: string } {
  if (!user) {
    return { name: '', email: '', role: 'student', avatar: undefined }
  }

  return {
    name: user.nama,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  }
}
