import type { ICourseMentorItem } from '@/lib/types/user'
import type { UserRole } from '@/lib/types/user'

export type StaffGraderDirectoryEntry = {
  uid: string
  name: string
  avatar_url: string
  role: UserRole
}

function toUserRole(role: string | undefined): UserRole {
  if (role === 'admin' || role === 'mentor' || role === 'student') {
    return role
  }

  return 'mentor'
}

export function buildStaffGraderDirectory(
  mentors: Pick<ICourseMentorItem, 'uid' | 'name' | 'avatar_url' | 'role'>[] = [],
): StaffGraderDirectoryEntry[] {
  const seen = new Set<string>()
  const entries: StaffGraderDirectoryEntry[] = []

  for (const mentor of mentors) {
    if (!mentor.uid || seen.has(mentor.uid)) continue

    seen.add(mentor.uid)
    entries.push({
      uid: mentor.uid,
      name: mentor.name,
      avatar_url: mentor.avatar_url ?? '',
      role: toUserRole(mentor.role),
    })
  }

  return entries
}

export function resolveStaffGraderFromDirectory(
  gradedByUid: string | null,
  directory: StaffGraderDirectoryEntry[],
): StaffGraderDirectoryEntry | null {
  if (!gradedByUid) return null
  return directory.find((entry) => entry.uid === gradedByUid) ?? null
}
