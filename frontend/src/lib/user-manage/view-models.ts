import type { AdminAdministrator, AdminMentor } from '@/lib/types/api'
import type { AdminStudent } from '@/lib/types/user'

export type ManagedUserRow = {
  uid: string
  name: string
  email: string
  avatar: string
  isVerified: boolean
  joinedAt: string
  enrolledCourses?: number
  averageProgress?: number
  roleLabel?: string
}

export function studentToRow(student: AdminStudent): ManagedUserRow {
  return {
    uid: student.uid,
    name: student.name,
    email: student.email,
    avatar: student.avatar,
    isVerified: student.isVerified,
    joinedAt: student.joinedAt,
    enrolledCourses: student.enrolledCourses,
    averageProgress: student.averageProgress,
  }
}

export function mentorToRow(mentor: AdminMentor): ManagedUserRow {
  return {
    uid: mentor.uid,
    name: mentor.name,
    email: mentor.email,
    avatar: mentor.avatar,
    isVerified: mentor.isVerified,
    joinedAt: mentor.joinedAt,
  }
}

export function administratorToRow(admin: AdminAdministrator): ManagedUserRow {
  return {
    uid: admin.uid,
    name: admin.name,
    email: admin.email,
    avatar: admin.avatar,
    isVerified: admin.isVerified,
    joinedAt: admin.createdAt,
    roleLabel: admin.role,
  }
}

export type PromoteCandidate = {
  uid: string
  name: string
  email: string
  avatar: string
  detail: string
  sourceRoleLabel: string
}

export function rowsToPromoteCandidates(
  rows: ManagedUserRow[],
  sourceRoleLabel: string,
): PromoteCandidate[] {
  return rows.map((row) => ({
    uid: row.uid,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    detail:
      row.enrolledCourses != null && row.enrolledCourses > 0
        ? `${row.enrolledCourses} kursus • progres rata-rata ${row.averageProgress ?? 0}%`
        : `Bergabung ${row.joinedAt}`,
    sourceRoleLabel,
  }))
}
