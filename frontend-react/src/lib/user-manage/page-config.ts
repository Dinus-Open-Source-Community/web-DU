import type { LucideIcon } from 'lucide-react'
import { Shield, UserRound, UsersRound } from 'lucide-react'

import { ROUTES } from '@/lib/routes'
import type { AssignableUserRole } from './types'

export type UserManageKind = 'student' | 'mentor' | 'admin'

type UserManagePageConfig = {
  kind: UserManageKind
  icon: LucideIcon
  navLabel: string
  path: string
  pageTitle: string
  pageSubtitle: string
  searchPlaceholder: string
  emptyTitle: string
  emptyDescription: string
  listRole: AssignableUserRole | 'admin'
  roleTargets: AssignableUserRole[]
  promote?: {
    triggerLabel: string
    dialogTitle: string
    dialogDescription: string
    confirmLabel: string
    targetRole: AssignableUserRole
    searchPlaceholder: string
    emptyTitle: string
    emptyDescription: string
    footerHint: (name: string) => string
  }
}

export const USER_MANAGE_NAV: UserManagePageConfig[] = [
  {
    kind: 'student',
    icon: UserRound,
    navLabel: 'Siswa',
    path: ROUTES.admin.users.students,
    pageTitle: 'Manajemen Siswa',
    pageSubtitle: 'Kelola akun siswa, pantau progres belajar, dan ubah role bila diperlukan.',
    searchPlaceholder: 'Cari nama, email, atau ID siswa...',
    emptyTitle: 'Belum ada siswa',
    emptyDescription: 'Tidak ada siswa yang cocok dengan filter saat ini.',
    listRole: 'student',
    roleTargets: ['mentor', 'admin'],
  },
  {
    kind: 'mentor',
    icon: UsersRound,
    navLabel: 'Mentor',
    path: ROUTES.admin.users.mentors,
    pageTitle: 'Manajemen Mentor',
    pageSubtitle: 'Kelola mentor platform, promosikan siswa, dan atur akses pengajar.',
    searchPlaceholder: 'Cari nama, email, atau ID mentor...',
    emptyTitle: 'Belum ada mentor',
    emptyDescription: 'Tidak ada mentor yang cocok dengan filter saat ini.',
    listRole: 'mentor',
    roleTargets: ['student', 'admin'],
    promote: {
      triggerLabel: 'Promosikan siswa',
      dialogTitle: 'Jadikan mentor',
      dialogDescription: 'Pilih siswa yang akan dipromosikan menjadi mentor platform.',
      confirmLabel: 'Jadikan mentor',
      targetRole: 'mentor',
      searchPlaceholder: 'Cari nama, email, atau ID siswa...',
      emptyTitle: 'Tidak ada siswa cocok',
      emptyDescription: 'Coba kata kunci lain untuk menemukan kandidat mentor.',
      footerHint: (name) => `${name} akan diubah rolenya menjadi mentor.`,
    },
  },
  {
    kind: 'admin',
    icon: Shield,
    navLabel: 'Administrator',
    path: ROUTES.admin.users.administrators,
    pageTitle: 'Administrator Platform',
    pageSubtitle: 'Kelola staf internal dengan akses panel admin dan kredensial akun mereka.',
    searchPlaceholder: 'Cari nama atau email administrator...',
    emptyTitle: 'Belum ada administrator',
    emptyDescription: 'Promosikan user untuk mulai mengelola sistem.',
    listRole: 'admin',
    roleTargets: ['mentor', 'student'],
    promote: {
      triggerLabel: 'Jadikan admin',
      dialogTitle: 'Promosikan ke administrator',
      dialogDescription: 'Pilih mentor atau siswa yang akan diberi akses administrator.',
      confirmLabel: 'Jadikan admin',
      targetRole: 'admin',
      searchPlaceholder: 'Cari nama, email, atau ID user...',
      emptyTitle: 'Tidak ada user cocok',
      emptyDescription: 'Coba ubah kata kunci pencarian untuk melihat kandidat lain.',
      footerHint: (name) => `${name} akan diubah rolenya menjadi admin.`,
    },
  },
]

export function getUserManageConfig(kind: UserManageKind) {
  const config = USER_MANAGE_NAV.find((item) => item.kind === kind)
  if (!config) {
    throw new Error(`Unknown user manage kind: ${kind}`)
  }
  return config
}

export const ROLE_LABELS: Record<AssignableUserRole, string> = {
  student: 'Siswa',
  mentor: 'Mentor',
  admin: 'Administrator',
}

export const ROLE_DESCRIPTIONS: Record<AssignableUserRole, string> = {
  student: 'Akses belajar, enrollment kursus, dan aktivitas siswa.',
  mentor: 'Mengelola kursus, materi, dan interaksi dengan peserta.',
  admin: 'Akses penuh ke panel administrasi platform.',
}
