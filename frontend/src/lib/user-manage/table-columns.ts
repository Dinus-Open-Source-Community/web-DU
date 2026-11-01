import type { UserManageKind } from './page-config'

export type UserManageColumnAlign = 'left' | 'center' | 'right'

export type UserManageColumnId = 'user' | 'verified' | 'courses' | 'joined' | 'actions'

export type UserManageColumnSpec = {
  id: UserManageColumnId
  header: string
  align?: UserManageColumnAlign
}

/**
 * Satu sumber urutan/lebar/penyelarasan kolom tabel manajemen user.
 *
 * Dipakai oleh `buildUserManageColumns` (tabel asli) dan
 * `UserManageTableSkeleton` (placeholder loading), supaya bentuk skeleton
 * selalu sama dengan tabel yang nanti dirender.
 *
 * - Siswa: User · Verifikasi Email · Kursus · Bergabung · Aksi
 * - Mentor/Administrator: User · Verifikasi Email · Bergabung · Aksi
 */
export function getUserManageColumnSpecs(kind: UserManageKind): UserManageColumnSpec[] {
  const specs: UserManageColumnSpec[] = [
    { id: 'user', header: 'User' },
    { id: 'verified', header: 'Verifikasi Email' },
  ]

  if (kind === 'student') {
    specs.push({ id: 'courses', header: 'Kursus', align: 'center' })
  }

  specs.push({ id: 'joined', header: 'Bergabung' })
  specs.push({ id: 'actions', header: 'Aksi', align: 'right' })

  return specs
}
