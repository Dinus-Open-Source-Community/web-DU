/**
 * Adapter pengguna dummy — selaraskan dengan sesi auth cookie jika sudah login,
 * agar `mentorCourseStorage` & modul lain mendapat `id` konsisten (`mnt-arya`, `stu-001`, …).
 */

import { getAuthUser } from '@/lib/auth/session'
import type { AuthUser, UserRole } from '@/lib/auth/session'

export type { UserRole }

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
  role: 'admin',
  avatar: undefined,
}

export function getActiveUser(): DummyUser {
  const u = getAuthUser()
  if (!u) return EMPTY_USER

  return {
    id: u.uid,
    nama: u.nama,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
  }
}

export function toSidebarUser(user: DummyUser | AuthUser | null | undefined): { name: string; email: string; role: string; avatar?: string } {
  if (!user) {
    return { name: '', email: '', role: 'admin', avatar: undefined }
  }

  return {
    name: user.nama,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  }
}
