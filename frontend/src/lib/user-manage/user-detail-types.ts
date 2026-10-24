import type { EnrollmentStatus } from '@/lib/types/common/domain'

export type ManagedUserDetailCourseRef = {
  uid: string
  title: string
  slug: string
}

export type ManagedUserDetailAssignment = {
  submissionUid: string
  attemptCount: number
  scorePercent: number | null
  passed: boolean | null
  isAutoGraded: boolean
  submittedAtLabel: string
  gradedAtLabel: string | null
  assignmentTitle: string
  taskType: string
  taskTypeLabel: string
  deadlineAtLabel: string | null
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
  levelLabel: string
  mentorNamesLabel: string | null
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
  levelLabel: string
  status: string
  statusLabel: string
  isPublished: boolean
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

export type ManagedUserDetailProfile = {
  uid: string
  name: string
  email: string
  avatar: string
  role: string
  roleLabel: string
  isVerified: boolean
  createdAtLabel: string
}

export type ManagedUserDetailStat = {
  id: string
  label: string
  value: string
}

export type ManagedUserDetailTab = 'courses' | 'mentored' | 'reviews' | 'profile'

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
    total: number
    active: number
    completed: number
  }
}
