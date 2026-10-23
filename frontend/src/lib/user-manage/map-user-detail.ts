import { formatLearningProgressLabel, toLearningProgressPercent } from '@/lib/learning/progress'
import { ROUTES } from '@/lib/routes'
import type { EnrollmentStatus } from '@/lib/types/common/domain'
import type { ManagedUserDetailApiResponse } from './user-detail-api-types'
import type {
  ManagedUserDetailAssignment,
  ManagedUserDetailJoinedCourse,
  ManagedUserDetailMentoredCourse,
  ManagedUserDetailProfile,
  ManagedUserDetailReview,
} from './user-detail-types'

const DEFAULT_AVATAR = '/Logo.svg'

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatDate(value?: string | null) {
  if (!value) return '-'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : dateFormatter.format(parsed)
}

const ROLE_LABELS: Record<string, string> = {
  student: 'Siswa',
  mentor: 'Mentor',
  admin: 'Administrator',
  super_admin: 'Super Admin',
}

const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending: 'Menunggu',
  active: 'Aktif',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

const COURSE_LEVEL_LABELS: Record<string, string> = {
  beginner: 'Pemula',
  pemula: 'Pemula',
  intermediate: 'Menengah',
  menengah: 'Menengah',
  advanced: 'Lanjutan',
  lanjutan: 'Lanjutan',
  all_levels: 'Semua Level',
  'semua level': 'Semua Level',
}

const COURSE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draf',
  draf: 'Draf',
  published: 'Aktif',
  aktif: 'Aktif',
  active: 'Aktif',
  archived: 'Arsip',
  arsip: 'Arsip',
}

const TASK_TYPE_LABELS: Record<string, string> = {
  quiz: 'Kuis',
  text: 'Tugas Teks',
  file: 'Unggah Berkas',
}

function mapRoleLabel(role: string) {
  return ROLE_LABELS[role] ?? role
}

function mapCourseLevelLabel(level?: string) {
  if (!level) return '-'
  const normalized = level.trim().toLowerCase()
  return COURSE_LEVEL_LABELS[normalized] ?? level
}

function mapCourseStatusLabel(status?: string) {
  if (!status) return '-'
  const normalized = status.trim().toLowerCase()
  return COURSE_STATUS_LABELS[normalized] ?? status
}

function mapTaskTypeLabel(taskType?: string) {
  if (!taskType) return 'Tugas'
  return TASK_TYPE_LABELS[taskType] ?? taskType
}

function formatNullableDate(value?: string | null) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime()) || parsed.getFullYear() <= 1971) return null
  return dateFormatter.format(parsed)
}

function mapAssignments(
  assignments: ManagedUserDetailApiResponse['joined_courses'][number]['assignments'],
): ManagedUserDetailAssignment[] {
  if (!assignments?.length) return []

  return assignments.map((item) => ({
    submissionUid: item.submission_uid,
    attemptCount: item.attempt_count,
    scorePercent: item.score_percent,
    passed: item.passed ?? null,
    isAutoGraded: Boolean(item.is_auto_graded),
    submittedAtLabel: formatDate(item.submitted_at),
    gradedAtLabel: formatNullableDate(item.graded_at),
    assignmentTitle: item.assignment.title,
    taskType: item.assignment.task_type,
    taskTypeLabel: mapTaskTypeLabel(item.assignment.task_type),
    deadlineAtLabel: formatNullableDate(item.assignment.deadline_at),
    lessonTitle: item.lesson.title,
    moduleTitle: item.module.title,
  }))
}

function mapJoinedCourses(
  courses: ManagedUserDetailApiResponse['joined_courses'],
): ManagedUserDetailJoinedCourse[] {
  return courses.map((course) => {
    const mentorNames = (course.mentors ?? [])
      .map((m) => m.name?.trim())
      .filter((name): name is string => Boolean(name))

    return {
      uid: course.uid,
      title: course.title,
      subtitle: course.subtitle ?? '',
      slug: course.slug,
      thumbnailUrl: course.thumbnail_url || course.cover_url || '',
      level: course.level,
      levelLabel: mapCourseLevelLabel(course.level),
      mentorNamesLabel: mentorNames.length > 0 ? mentorNames.join(', ') : null,
      enrollmentStatus: course.enrollment_status,
      enrollmentStatusLabel: ENROLLMENT_STATUS_LABELS[course.enrollment_status],
      progressPercent: toLearningProgressPercent(course.progress),
      progressLabel: formatLearningProgressLabel(course.progress),
      enrolledAtLabel: formatDate(course.enrolled_at),
      isPublished: course.is_published,
      assignments: mapAssignments(course.assignments),
      adminCourseHref: ROUTES.admin.detailCourseAdmin(course.uid),
    }
  })
}

function mapMentoredCourses(
  courses: ManagedUserDetailApiResponse['mentored_courses'],
): ManagedUserDetailMentoredCourse[] {
  return courses.map((course) => ({
    uid: course.uid,
    title: course.title,
    subtitle: course.subtitle ?? '',
    slug: course.slug,
    level: course.level,
    levelLabel: mapCourseLevelLabel(course.level),
    status: course.status,
    statusLabel: mapCourseStatusLabel(course.status),
    isPublished: course.is_published,
    createdAtLabel: formatDate(course.created_at),
    adminCourseHref: ROUTES.admin.detailCourseAdmin(course.uid),
  }))
}

function mapReviews(reviews: ManagedUserDetailApiResponse['course_reviews']): ManagedUserDetailReview[] {
  return reviews.map((review) => ({
    uid: review.uid,
    rating: review.rating,
    comment: review.comment,
    createdAtLabel: formatDate(review.created_at),
    courseTitle: review.course?.title ?? 'Kursus tidak diketahui',
    courseSlug: review.course?.slug ?? null,
  }))
}

export function mapManagedUserDetailProfile(data: ManagedUserDetailApiResponse): ManagedUserDetailProfile {
  return {
    uid: data.uid,
    name: data.name,
    email: data.email,
    avatar: data.avatar_url || DEFAULT_AVATAR,
    role: data.role,
    roleLabel: mapRoleLabel(data.role),
    isVerified: data.is_verified,
    createdAtLabel: formatDate(data.created_at),
  }
}

export function mapManagedUserDetail(data: ManagedUserDetailApiResponse) {
  const profile = mapManagedUserDetailProfile(data)
  const joinedCourses = mapJoinedCourses(data.joined_courses ?? [])
  const mentoredCourses = mapMentoredCourses(data.mentored_courses ?? [])
  const reviews = mapReviews(data.course_reviews ?? [])

  return {
    profile,
    joinedCourses,
    mentoredCourses,
    reviews,
    reviewSummary: {
      totalReviews: data.review_summary?.total_reviews ?? 0,
      averageRatingLabel: (data.review_summary?.average_rating ?? 0).toFixed(1),
    },
    enrollmentSummary: {
      pending: data.enrollment_summary?.pending ?? 0,
      active: data.enrollment_summary?.active ?? 0,
      completed: data.enrollment_summary?.completed ?? 0,
      cancelled: data.enrollment_summary?.cancelled ?? 0,
    },
  }
}
