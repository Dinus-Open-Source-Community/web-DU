import type { UserRole } from '@/lib/types/user'

export type StaffSubmissionViewer = {
  uid: string
  name: string
  avatar_url: string
  role: UserRole
}

export type StaffSubmissionGraderView = {
  uid: string
  name: string
  avatar_url: string
  role: UserRole | null
  isKnownViewer: boolean
}

const GRADER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  mentor: 'Mentor',
  student: 'Siswa',
}

export function formatGraderRoleLabel(role: UserRole | null | undefined): string | null {
  if (!role) return null
  return GRADER_ROLE_LABELS[role] ?? role
}

export function presentSubmissionGrader(
  gradedByUid: string | null,
  viewer: StaffSubmissionViewer | null,
): StaffSubmissionGraderView | null {
  if (!gradedByUid) return null

  if (viewer?.uid === gradedByUid) {
    return {
      uid: viewer.uid,
      name: viewer.name,
      avatar_url: viewer.avatar_url,
      role: viewer.role,
      isKnownViewer: true,
    }
  }

  return {
    uid: gradedByUid,
    name: 'Penilai',
    avatar_url: '',
    role: null,
    isKnownViewer: false,
  }
}
