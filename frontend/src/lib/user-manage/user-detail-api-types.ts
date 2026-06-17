import type { EnrollmentStatus, PaymentStatus } from '@/lib/types/common/domain'
import type { IEnrollmentInvoice } from '@/lib/types/user'

export type ManagedUserDetailApiCourseRef = {
  uid: string
  title: string
  slug: string
}

export type ManagedUserDetailApiAssignment = {
  submission_uid: string
  attempt_count: number
  score_percent: number | null
  passed: boolean
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
  enrollment_status: EnrollmentStatus
  progress: number
  enrolled_at: string
  is_published: boolean
  assignments?: ManagedUserDetailApiAssignment[]
}

export type ManagedUserDetailApiMentoredCourse = {
  uid: string
  title: string
  subtitle?: string
  slug: string
  level: string
  status: string
  price: number
  is_premium: boolean
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

export type ManagedUserDetailApiTransaction = {
  uid: string
  reference: string
  amount: number
  payment_method: string
  payment_status: PaymentStatus
  checkout_url?: string
  paid_at: string | null
  transaction_at: string
  enrollment_uid: string
  enrollment_status: EnrollmentStatus
  course: ManagedUserDetailApiCourseRef | null
}

export type ManagedUserDetailApiResponse = {
  uid: string
  name: string
  email: string
  avatar_url: string
  role: string
  is_verified: boolean
  description: string
  created_at: string
  updated_at: string
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
  enrollment_invoices: IEnrollmentInvoice[]
  mentored_courses: ManagedUserDetailApiMentoredCourse[]
  transaction_history: ManagedUserDetailApiTransaction[]
}
