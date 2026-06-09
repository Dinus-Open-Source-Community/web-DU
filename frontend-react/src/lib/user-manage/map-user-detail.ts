import { FormatDateTime, FormatRupiah } from '@/lib/func/func'
import { formatLearningProgressLabel, toLearningProgressPercent } from '@/lib/learning/progress'
import { ROUTES } from '@/lib/routes'
import type { EnrollmentStatus } from '@/lib/types/common/domain'
import type { AdminStatus } from '@/lib/types/user'
import type { ManagedUserDetailApiResponse } from './user-detail-api-types'
import type {
  ManagedUserDetailAssignment,
  ManagedUserDetailJoinedCourse,
  ManagedUserDetailMentoredCourse,
  ManagedUserDetailProfile,
  ManagedUserDetailReview,
  ManagedUserDetailTransaction,
} from './user-detail-types'

const DEFAULT_AVATAR = '/pinguin.png'

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

function resolveStatus(isVerified: boolean): AdminStatus {
  return isVerified ? 'active' : 'pending'
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

function mapRoleLabel(role: string) {
  return ROLE_LABELS[role] ?? role
}

function mapAssignments(
  assignments: ManagedUserDetailApiResponse['joined_courses'][number]['assignments'],
): ManagedUserDetailAssignment[] {
  if (!assignments?.length) return []

  return assignments.map((item) => ({
    submissionUid: item.submission_uid,
    attemptCount: item.attempt_count,
    scorePercent: item.score_percent,
    passed: item.passed,
    submittedAtLabel: formatDate(item.submitted_at),
    assignmentTitle: item.assignment.title,
    lessonTitle: item.lesson.title,
    moduleTitle: item.module.title,
  }))
}

function mapJoinedCourses(
  courses: ManagedUserDetailApiResponse['joined_courses'],
): ManagedUserDetailJoinedCourse[] {
  return courses.map((course) => ({
    uid: course.uid,
    title: course.title,
    subtitle: course.subtitle ?? '',
    slug: course.slug,
    thumbnailUrl: course.thumbnail_url || course.cover_url || '',
    level: course.level,
    enrollmentStatus: course.enrollment_status,
    enrollmentStatusLabel: ENROLLMENT_STATUS_LABELS[course.enrollment_status],
    progressPercent: toLearningProgressPercent(course.progress),
    progressLabel: formatLearningProgressLabel(course.progress),
    enrolledAtLabel: formatDate(course.enrolled_at),
    isPublished: course.is_published,
    assignments: mapAssignments(course.assignments),
    adminCourseHref: ROUTES.admin.detailCourseAdmin(course.uid),
  }))
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
    status: course.status,
    isPublished: course.is_published,
    priceLabel: String(FormatRupiah(course.price)),
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

function mapTransactions(
  transactions: ManagedUserDetailApiResponse['transaction_history'],
): ManagedUserDetailTransaction[] {
  return transactions.map((transaction) => ({
    uid: transaction.uid,
    reference: transaction.reference,
    amountLabel: String(FormatRupiah(transaction.amount)),
    paymentMethod: transaction.payment_method,
    paymentStatus: transaction.payment_status,
    transactionAtLabel: FormatDateTime(transaction.transaction_at),
    paidAtLabel: transaction.paid_at ? FormatDateTime(transaction.paid_at) : null,
    enrollmentStatus: transaction.enrollment_status,
    courseTitle: transaction.course?.title ?? 'Kursus tidak diketahui',
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
    status: resolveStatus(data.is_verified),
    isVerified: data.is_verified,
    description: data.description?.trim() ? data.description : null,
    createdAtLabel: formatDate(data.created_at),
    updatedAtLabel: formatDate(data.updated_at),
  }
}

export function mapManagedUserDetail(data: ManagedUserDetailApiResponse) {
  const profile = mapManagedUserDetailProfile(data)
  const joinedCourses = mapJoinedCourses(data.joined_courses ?? [])
  const mentoredCourses = mapMentoredCourses(data.mentored_courses ?? [])
  const reviews = mapReviews(data.course_reviews ?? [])
  const transactions = mapTransactions(data.transaction_history ?? [])

  return {
    profile,
    joinedCourses,
    mentoredCourses,
    reviews,
    transactions,
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
