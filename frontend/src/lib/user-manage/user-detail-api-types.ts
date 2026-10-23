import type { EnrollmentStatus } from '@/lib/types/common/domain'

export type ManagedUserDetailApiCourseRef = {
  uid: string
  title: string
  slug: string
}

export type ManagedUserDetailApiMentorRef = {
  uid: string
  name: string
  email?: string
  avatar_url?: string
}

export type ManagedUserDetailApiAssignment = {
  submission_uid: string
  attempt_count: number
  score_percent: number | null
  passed: boolean | null
  is_auto_graded: boolean
  submitted_at: string
  graded_at: string | null
  assignment: {
    uid: string
    title: string
    status: string
    task_type: string
    deadline_at: string | null
  }
  lesson: {
    uid: string
    title: string
    order_index: number
  }
  module: {
    uid: string
    title: string
    order_index: number
  }
}

export type ManagedUserDetailApiJoinedCourse = {
  uid: string
  title: string
  subtitle?: string
  slug: string
  thumbnail_url?: string
  cover_url?: string
  level: string
  status?: string
  enrollment_status: EnrollmentStatus
  progress: number
  enrolled_at: string
  is_published: boolean
  mentors?: ManagedUserDetailApiMentorRef[]
  assignments?: ManagedUserDetailApiAssignment[]
}

export type ManagedUserDetailApiMentoredCourse = {
  uid: string
  title: string
  subtitle?: string
  slug: string
  level: string
  status: string
  is_published: boolean
  created_at: string
}

export type ManagedUserDetailApiReview = {
  uid: string
  rating: number
  comment: string
  created_at: string
  course: ManagedUserDetailApiCourseRef | null
}

export type ManagedUserDetailApiResponse = {
  uid: string
  name: string
  email: string
  avatar_url: string
  role: string
  is_verified: boolean
  created_at: string
  joined_courses: ManagedUserDetailApiJoinedCourse[]
  course_reviews: ManagedUserDetailApiReview[]
  review_summary: {
    total_reviews: number
    average_rating: number
  }
  enrollment_summary: {
    pending: number
    active: number
    completed: number
    cancelled: number
  }
  mentored_courses: ManagedUserDetailApiMentoredCourse[]
}
