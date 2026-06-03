import type { TransactionHistory } from './transaction'

export type AdminStatus = 'active' | 'inactive' | 'pending'
export type UserRole = 'student' | 'mentor' | 'admin'
export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled'
export type CourseLevel = 'PEMULA' | 'MENENGAH' | 'LANJUTAN'
export type CourseStatus = 'DRAFT' | 'PUBLISHED'

export interface IUser {
  nama: string
  email: string
  avatar: string
  role: UserRole
}

export interface IMentor {
  uid: string
  name: string
  email: string
  avatar_url: string
  role: UserRole
  description: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface AdminStudent {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  enrolledCourses: number
  averageProgress: number
  status: AdminStatus
  totalSpent: number
  phone?: string
  lastActive: string
}

export interface CourseDetail {
  uid: string
  title: string
  subtitle: string
  slug: string
  cover_url: string
  thumbnail_url: string
  level: CourseLevel
  status: CourseStatus
  is_published: boolean
  is_premium: boolean
  price: number
  price_strike?: number
  description?: string
  category_uid?: string
  course_type_uid?: string
  created_at?: string
  updated_at?: string
  created_by?: CourseCreator
  event_uid?: string | null
  mentor_uid?: string
  mentors?: IMentor[]
  slot?: number
  what_you_learn?: string[]
  rating?: number
  total_reviews?: number
}

export interface EnrollmentInvoice {
  enrollment_uid: string
  course_uid: string
  user_uid: string
  enrolled_at: string
  enrollment_status: EnrollmentStatus
  progress: number
  course: CourseDetail
}

export interface JoinedCourse extends CourseDetail {
  enrolled_at: string
  enrollment_status: EnrollmentStatus
  progress: number
}

export interface EnrollmentSummary {
  total: number
  active: number
  pending: number
  completed: number
  cancelled: number
}

export interface ReviewSummary {
  total_reviews: number
  average_rating: number
}

export interface CourseCreator {
  uid: string
  name: string
  avatar_url: string
  role: UserRole
  is_verified: boolean
}

export interface CourseSummary {
  uid: string
  title: string
  slug: string
}

export interface CourseReview {
  uid: string
  rating: number
  comment: string
  created_at: string
  course: CourseSummary
}

export interface IUserData {
  uid: string
  name: string
  email: string
  avatar_url: string
  role: UserRole
  description: string
  is_verified: boolean
  created_at: string
  updated_at: string
  enrollment_summary: EnrollmentSummary
  review_summary: ReviewSummary
  enrollment_invoices: EnrollmentInvoice[]
  joined_courses: JoinedCourse[]
  mentored_courses: CourseDetail[]
  course_reviews: CourseReview[]
  transaction_history: TransactionHistory[]
}

export interface IUpdatePasswordPayload {
  new_password: string
}

export interface IUpdateProfilePayload {
  name?: string
  email?: string
  description?: string
}
