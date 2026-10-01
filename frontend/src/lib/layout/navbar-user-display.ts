import type { UserRole } from '@/lib/types/user'

export const navbarUserRoleLabel: Record<UserRole, string> = {
  admin: 'Administrator',
  super_admin: 'Super Administrator',
  mentor: 'Mentor',
  student: 'Siswa',
}

export function greetingForUser(name: string): string {
  const first = name.trim().split(/\s+/).filter(Boolean)[0]
  return first ? `Halo, ${first}!` : 'Halo!'
}
