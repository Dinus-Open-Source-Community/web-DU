import type { ICourseDetailItem, ICourseItem, IAdminQaThread, IAdminReview } from '@/lib/types/course'
import type { ICourseStudentListResponse } from '@/lib/types/course'
import type { IManagedUserItem } from '@/lib/types/features/user-manage'
import type { IUserData } from '@/lib/types/user'
import type { ManagedUserDetailApiResponse } from '@/lib/user-manage/user-detail-api-types'

import { parseProtectedFileReference } from './parse-protected-file-reference'

function pushReference(refs: string[], value?: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return
  refs.push(trimmed)
}

type CourseImageSource = {
  cover_url?: string
  thumbnail_url?: string
  mentors?: Array<{ avatar_url?: string }>
  created_by?: { avatar_url?: string }
}

function collectCourseImageSourceReferences(course: CourseImageSource): string[] {
  const refs: string[] = []
  pushReference(refs, course.cover_url)
  pushReference(refs, course.thumbnail_url)
  for (const mentor of course.mentors ?? []) {
    pushReference(refs, mentor.avatar_url)
  }
  pushReference(refs, course.created_by?.avatar_url)
  return refs
}

export function collectCourseListImageReferences(courses?: ICourseItem[] | null): string[] {
  if (!courses?.length) return []
  return courses.flatMap((course) => collectCourseImageSourceReferences(course))
}

export function collectCourseDetailImageReferences(course?: ICourseDetailItem | null): string[] {
  if (!course) return []
  const refs: string[] = []
  pushReference(refs, course.cover_url)
  pushReference(refs, course.thumbnail_url)
  for (const mentor of course.mentors ?? []) {
    pushReference(refs, mentor.avatar_url)
  }
  pushReference(refs, course.created_by?.avatar_url)
  for (const review of course.reviews ?? []) {
    pushReference(refs, review.user?.avatar_url)
    for (const reply of review.replies ?? []) {
      pushReference(refs, reply.user?.avatar_url)
    }
  }
  return refs
}

export function collectCourseStudentsImageReferences(
  students?: ICourseStudentListResponse | null,
): string[] {
  if (!students?.enrollments?.length) return []
  return students.enrollments
    .map((student) => student.student_avatar_url)
    .filter((value): value is string => Boolean(value?.trim()))
}

export function collectUserProfileAvatarReference(profile?: IUserData | null): string[] {
  if (!profile?.avatar_url?.trim()) return []
  return [profile.avatar_url]
}

export function collectUserProfileImageReferences(profile?: IUserData | null): string[] {
  if (!profile) return []
  const refs: string[] = []
  pushReference(refs, profile.avatar_url)
  for (const course of profile.joined_courses ?? []) {
    refs.push(...collectCourseImageSourceReferences(course))
  }
  for (const course of profile.mentored_courses ?? []) {
    refs.push(...collectCourseImageSourceReferences(course))
  }
  return refs
}

export function collectManagedUsersListImageReferences(
  users?: IManagedUserItem[] | null,
): string[] {
  if (!users?.length) return []
  return users
    .map((user) => user.avatar_url)
    .filter((value): value is string => Boolean(value?.trim()))
}

export function collectManagedUserDetailImageReferences(
  detail?: ManagedUserDetailApiResponse | null,
): string[] {
  if (!detail) return []
  const refs: string[] = []
  pushReference(refs, detail.avatar_url)
  for (const course of detail.joined_courses ?? []) {
    pushReference(refs, course.cover_url)
    pushReference(refs, course.thumbnail_url)
  }
  return refs
}

export function collectAdminModerationImageReferences(
  reviews?: IAdminReview[] | null,
  threads?: IAdminQaThread[] | null,
): string[] {
  const refs: string[] = []

  for (const review of reviews ?? []) {
    pushReference(refs, review.studentAvatar)
  }

  for (const thread of threads ?? []) {
    pushReference(refs, thread.authorAvatar)
    for (const reply of thread.replies ?? []) {
      pushReference(refs, reply.authorAvatar)
    }
  }

  return refs
}

export type ProtectedFileBucketGroup = {
  bucket: string
  items: Array<{
    source: string
    objectKey: string
  }>
}

export function groupProtectedFileReferences(
  references: readonly (string | null | undefined)[],
): ProtectedFileBucketGroup[] {
  const bucketMap = new Map<string, ProtectedFileBucketGroup['items']>()
  const seen = new Set<string>()

  for (const reference of references) {
    const trimmed = reference?.trim()
    if (!trimmed) continue

    const parsed = parseProtectedFileReference(trimmed)
    if (!parsed) continue

    const dedupeKey = `${parsed.bucket}/${parsed.objectKey}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    const bucketItems = bucketMap.get(parsed.bucket) ?? []
    bucketItems.push({
      source: trimmed,
      objectKey: parsed.objectKey,
    })
    bucketMap.set(parsed.bucket, bucketItems)
  }

  return [...bucketMap.entries()].map(([bucket, items]) => ({ bucket, items }))
}
