import type { UserRole } from '@/lib/auth/session'

/** UID konsisten dengan `lib/data/dummy-seed.ts` untuk data dummy (middleware / RBAC pakai cookie `du_auth_role`). */
export function dummyUidForRole(role: UserRole): string {
  switch (role) {
    case 'mentor':
      return 'mnt-arya'
    case 'admin':
      return 'adm-wulan'
    default:
      return 'stu-001'
  }
}
