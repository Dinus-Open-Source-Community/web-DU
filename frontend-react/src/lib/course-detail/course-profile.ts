import type { IAuthorCourseItem, ICourseMentorItem } from '@/lib/types/user'

export const DEFAULT_COURSE_PROFILE_AVATAR = '/pinguin.png'

export type CourseProfile = {
  uid?: string
  name: string
  avatar_url?: string
  role?: string
  description?: string
}

export type CourseProfileSource = {
  mentors?: Array<Partial<ICourseMentorItem>> | null
  created_by?: Partial<IAuthorCourseItem> | null
}

function isUsableProfile(
  person?: Partial<{ uid?: string; name?: string; avatar_url?: string; role?: string; description?: string }> | null,
): person is { name: string; uid?: string; avatar_url?: string; role?: string; description?: string } {
  return Boolean(person?.name?.trim())
}

/** Utamakan mentor pertama; fallback ke created_by / author kursus. */
export function resolveCourseProfile(source: CourseProfileSource): CourseProfile | null {
  const mentor = source.mentors?.find((item) => isUsableProfile(item))
  if (isUsableProfile(mentor)) {
    return {
      uid: mentor.uid,
      name: mentor.name.trim(),
      avatar_url: mentor.avatar_url,
      role: mentor.role,
      description: mentor.description,
    }
  }

  if (isUsableProfile(source.created_by)) {
    return {
      uid: source.created_by.uid,
      name: source.created_by.name.trim(),
      avatar_url: source.created_by.avatar_url,
      role: source.created_by.role,
    }
  }

  return null
}

export function resolveCourseProfileAvatar(
  profile: CourseProfile | null,
  fallback = DEFAULT_COURSE_PROFILE_AVATAR,
): string {
  const avatar = profile?.avatar_url?.trim()
  return avatar || fallback
}
