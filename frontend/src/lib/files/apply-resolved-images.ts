import type { ICourseDetailItem, ICourseItem, ICourseStudentListResponse, IAdminQaThread, IAdminReview } from '@/lib/types/course'
import type { IManagedUsersListResponse } from '@/lib/types/features/user-manage'
import type { IUserData } from '@/lib/types/user'
import type { ManagedUserDetailApiResponse } from '@/lib/user-manage/user-detail-api-types'

import { isResolvableProtectedFileReference } from './parse-protected-file-reference'

type ResolveDisplayUrl = (reference?: string | null) => string | null | undefined

function resolveReference(getDisplayUrl: ResolveDisplayUrl, reference?: string | null) {
  if (!reference?.trim()) return reference ?? ''

  const resolved = getDisplayUrl(reference)
  if (resolved) return resolved

  if (isResolvableProtectedFileReference(reference)) return ''
  return reference
}

type CourseImageFields = {
  cover_url?: string
  thumbnail_url?: string
  mentors?: Array<{ avatar_url?: string }>
  created_by?: { avatar_url?: string }
}

function applyCourseImageFields<T extends CourseImageFields>(
  course: T,
  getDisplayUrl: ResolveDisplayUrl,
): T {
  return {
    ...course,
    cover_url: resolveReference(getDisplayUrl, course.cover_url),
    thumbnail_url: resolveReference(getDisplayUrl, course.thumbnail_url),
    mentors: course.mentors?.map((mentor) => ({
      ...mentor,
      avatar_url: resolveReference(getDisplayUrl, mentor.avatar_url),
    })),
    created_by: course.created_by
      ? {
          ...course.created_by,
          avatar_url: resolveReference(getDisplayUrl, course.created_by.avatar_url),
        }
      : course.created_by,
  }
}

export function applyResolvedImagesToCourseItem(
  course: ICourseItem,
  getDisplayUrl: ResolveDisplayUrl,
): ICourseItem {
  return applyCourseImageFields(course, getDisplayUrl)
}

export function applyResolvedImagesToCourseDetail(
  course: ICourseDetailItem,
  getDisplayUrl: ResolveDisplayUrl,
): ICourseDetailItem {
  return {
    ...applyCourseImageFields(course, getDisplayUrl),
    reviews: course.reviews?.map((review) => ({
      ...review,
      user: {
        ...review.user,
        avatar_url: resolveReference(getDisplayUrl, review.user.avatar_url),
      },
      replies: review.replies?.map((reply) => ({
        ...reply,
        user: {
          ...reply.user,
          avatar_url: resolveReference(getDisplayUrl, reply.user.avatar_url),
        },
      })),
    })),
  }
}

export function applyResolvedImagesToCourseStudents(
  students: ICourseStudentListResponse,
  getDisplayUrl: ResolveDisplayUrl,
): ICourseStudentListResponse {
  return {
    ...students,
    enrollments: students.enrollments.map((student) => ({
      ...student,
      student_avatar_url: resolveReference(getDisplayUrl, student.student_avatar_url),
    })),
  }
}

export function applyResolvedAvatarToUserProfile(
  profile: IUserData,
  getDisplayUrl: ResolveDisplayUrl,
): IUserData {
  return {
    ...profile,
    avatar_url: resolveReference(getDisplayUrl, profile.avatar_url),
  }
}

export function applyResolvedImagesToUserProfile(
  profile: IUserData,
  getDisplayUrl: ResolveDisplayUrl,
): IUserData {
  return {
    ...profile,
    avatar_url: resolveReference(getDisplayUrl, profile.avatar_url),
    joined_courses: profile.joined_courses.map((course) =>
      applyCourseImageFields(course, getDisplayUrl),
    ),
    mentored_courses: profile.mentored_courses.map((course) =>
      applyCourseImageFields(course, getDisplayUrl),
    ),
  }
}

export function applyResolvedImagesToManagedUsersList(
  response: IManagedUsersListResponse,
  getDisplayUrl: ResolveDisplayUrl,
): IManagedUsersListResponse {
  return {
    ...response,
    users: response.users.map((user) => ({
      ...user,
      avatar_url: resolveReference(getDisplayUrl, user.avatar_url),
    })),
  }
}

export function applyResolvedImagesToManagedUserDetail(
  detail: ManagedUserDetailApiResponse,
  getDisplayUrl: ResolveDisplayUrl,
): ManagedUserDetailApiResponse {
  return {
    ...detail,
    avatar_url: resolveReference(getDisplayUrl, detail.avatar_url),
    joined_courses: detail.joined_courses.map((course) => ({
      ...course,
      cover_url: resolveReference(getDisplayUrl, course.cover_url),
      thumbnail_url: resolveReference(getDisplayUrl, course.thumbnail_url),
    })),
  }
}

export function applyResolvedImagesToAdminReview(
  review: IAdminReview,
  getDisplayUrl: ResolveDisplayUrl,
): IAdminReview {
  return {
    ...review,
    studentAvatar: resolveReference(getDisplayUrl, review.studentAvatar),
  }
}

export function applyResolvedImagesToAdminQnaThread(
  thread: IAdminQaThread,
  getDisplayUrl: ResolveDisplayUrl,
): IAdminQaThread {
  return {
    ...thread,
    authorAvatar: resolveReference(getDisplayUrl, thread.authorAvatar),
    replies: thread.replies.map((reply) => ({
      ...reply,
      authorAvatar: resolveReference(getDisplayUrl, reply.authorAvatar),
    })),
  }
}
