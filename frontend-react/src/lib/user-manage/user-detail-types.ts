import type { EnrollmentStatus, PaymentStatus } from '@/lib/types/common/domain'
import type { AdminStatus } from '@/lib/types/user'

export type ManagedUserDetailCourseRef = {
  uid: string
  title: string
  slug: string
}

export type ManagedUserDetailAssignment = {
  submissionUid: string
  attemptCount: number
  scorePercent: number | null
  passed: boolean
  submittedAtLabel: string
  assignmentTitle: string
  lessonTitle: string
  moduleTitle: string
}

export type ManagedUserDetailJoinedCourse = {
  uid: string
  title: string
  subtitle: string
  slug: string
  thumbnailUrl: string
  level: string
  enrollmentStatus: EnrollmentStatus
  enrollmentStatusLabel: string
  progressPercent: number
  progressLabel: string
  enrolledAtLabel: string
  isPublished: boolean
  assignments: ManagedUserDetailAssignment[]
  adminCourseHref: string
}

export type ManagedUserDetailMentoredCourse = {
  uid: string
  title: string
  subtitle: string
  slug: string
  level: string
  status: string
  isPublished: boolean
  priceLabel: string
  createdAtLabel: string
  adminCourseHref: string
}

export type ManagedUserDetailReview = {
  uid: string
  rating: number
  comment: string
  createdAtLabel: string
  courseTitle: string
  courseSlug: string | null
}

export type ManagedUserDetailTransaction = {
  uid: string
  reference: string
  amountLabel: string
  paymentMethod: string
  paymentStatus: PaymentStatus
  transactionAtLabel: string
  paidAtLabel: string | null
  enrollmentStatus: EnrollmentStatus
  courseTitle: string
}

export type ManagedUserDetailProfile = {
  uid: string
  name: string
  email: string
  avatar: string
  role: string
  roleLabel: string
  status: AdminStatus
  isVerified: boolean
  description: string | null
  createdAtLabel: string
  updatedAtLabel: string
}

export type ManagedUserDetailStat = {
  id: string
  label: string
  value: string
}

export type ManagedUserDetailTab = 'courses' | 'mentored' | 'reviews' | 'transactions' | 'profile'

export type ManagedUserDetailViewModel = {
  profile: ManagedUserDetailProfile
  stats: ManagedUserDetailStat[]
  tabs: ManagedUserDetailTab[]
  joinedCourses: ManagedUserDetailJoinedCourse[]
  mentoredCourses: ManagedUserDetailMentoredCourse[]
  reviews: ManagedUserDetailReview[]
  reviewSummary: {
    totalReviews: number
    averageRatingLabel: string
  }
  enrollmentSummary: {
    pending: number
    active: number
    completed: number
    cancelled: number
  }
  transactions: ManagedUserDetailTransaction[]
}
