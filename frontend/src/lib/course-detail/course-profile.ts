import type { IAuthorCourseItem, ICourseMentorItem } from '@/lib/types/user'

export const DEFAULT_COURSE_PROFILE_AVATAR = '/Logo.svg'

export type CourseProfile = {
  uid?: string
  name: string
  email?: string
  avatar_url?: string
  role?: string
  is_verified?: boolean
  created_at?: string
}

export type CourseProfileSource = {
  mentors?: Array<Partial<ICourseMentorItem>> | null
  created_by?: Partial<IAuthorCourseItem> | null
  mentor?: Partial<ICourseMentorItem> | null
}

type ProfileCandidate = Partial<{
  uid?: string
  name?: string
  email?: string
  avatar_url?: string
  role?: string
  is_verified?: boolean
  created_at?: string
}>

function isUsableProfile<T extends ProfileCandidate>(
  person?: T | null,
): person is T & { name: string } {
  return Boolean(person?.name?.trim())
}

/** Kumpulkan semua profil mentor/pembuat kursus (gabungkan mentors dan created_by tanpa duplikasi). */
export function resolveCourseProfiles(source: CourseProfileSource): CourseProfile[] {
  const result: CourseProfile[] = []
  const seenUids = new Set<string>()
  const seenNames = new Set<string>()

  const addProfile = (
    person?: Partial<{
      uid?: string
      name?: string
      email?: string
      avatar_url?: string
      role?: string
      is_verified?: boolean
      created_at?: string
    }> | null,
  ) => {
    if (!isUsableProfile(person)) return
    const name = person.name.trim()
    const uid = person.uid?.trim()

    if (uid && seenUids.has(uid)) return
    if (!uid && seenNames.has(name.toLowerCase())) return

    if (uid) seenUids.add(uid)
    seenNames.add(name.toLowerCase())

    result.push({
      uid: person.uid,
      name,
      email: person.email,
      avatar_url: person.avatar_url,
      role: person.role,
      is_verified: person.is_verified,
      created_at: person.created_at,
    })
  }

  if (Array.isArray(source.mentors)) {
    for (const mentor of source.mentors) {
      addProfile(mentor)
    }
  }

  if (source.mentor) {
    addProfile(source.mentor)
  }

  if (source.created_by) {
    addProfile(source.created_by)
  }

  return result
}

/** Profil utama (mentor pertama atau created_by). */
export function resolveCourseProfile(source: CourseProfileSource): CourseProfile | null {
  return resolveCourseProfiles(source)[0] ?? null
}

export function resolveCourseProfileAvatar(
  profile: CourseProfile | null,
  fallback = DEFAULT_COURSE_PROFILE_AVATAR,
): string {
  const avatar = profile?.avatar_url?.trim()
  return avatar || fallback
}
