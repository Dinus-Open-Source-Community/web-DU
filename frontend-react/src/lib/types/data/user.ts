import type { CourseApiLevel, CoursePublishStatus, EnrollmentStatus, UserRole } from '../common/domain'
import type { ITransactionHistory } from './transaction'
import type { IJoinedCourseAssignmentEntry } from './enrollment-assignment'

export interface ICourseMentorItem {
  avatar_url: string
  created_at: string
  description: string
  email: string
  is_verified: boolean
  name: string
  role: string
  uid: string
  updated_at: string
}

export interface IAuthorCourseItem {
  avatar_url: string
  is_verified: boolean
  name: string
  role: string
  uid: string
}

export interface IUpdatePasswordPayload {
  old_password?: string
  new_password: string
}

export interface IUpdateProfilePayload {
  name?: string
  email?: string
  description?: string
}

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

export interface ICourseCreator {
  uid: string
  name: string
  avatar_url: string
  role: UserRole
  is_verified: boolean
}

/** Ringkasan kursus untuk nested object di review/invoice. */
export interface ICourseSummary {
  uid: string
  title: string
  slug: string
}

/** Detail kursus di konteks enrollment user (profile/joined courses). */
export interface ICourseEnrollmentDetail {
  uid: string
  title: string
  subtitle: string
  slug: string
  cover_url: string
  thumbnail_url: string
  level: CourseApiLevel
  status: CoursePublishStatus
  is_published: boolean
  is_premium: boolean
  price: number
  price_strike?: number
  description?: string
  category_uid?: string
  course_type_uid?: string
  created_at?: string
  updated_at?: string
  created_by?: ICourseCreator
  event_uid?: string | null
  mentor_uid?: string
  mentors?: IMentor[]
  slot?: number
  what_you_learn?: string[]
  rating?: number
  total_reviews?: number
}

export interface IEnrollmentInvoice {
  enrollment_uid: string
  course_uid: string
  user_uid: string
  enrolled_at: string
  enrollment_status: EnrollmentStatus
  progress: number
  course: ICourseEnrollmentDetail
}

export interface IJoinedCourse extends ICourseEnrollmentDetail {
  enrolled_at: string
  enrollment_status: EnrollmentStatus
  progress: number
  assignments?: IJoinedCourseAssignmentEntry[]
}

export interface IEnrollmentSummary {
  total: number
  active: number
  pending: number
  completed: number
  cancelled: number
}

export interface IReviewSummary {
  total_reviews: number
  average_rating: number
}

export interface ICourseReview {
  uid: string
  rating: number
  comment: string
  created_at: string
  course: ICourseSummary
}

/** Response lengkap profil user dari GET /user/profile. */
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
  enrollment_summary: IEnrollmentSummary
  review_summary: IReviewSummary
  enrollment_invoices: IEnrollmentInvoice[]
  joined_courses: IJoinedCourse[]
  mentored_courses: ICourseEnrollmentDetail[]
  course_reviews: ICourseReview[]
  transaction_history: ITransactionHistory[]
}

/** Alias backward-compat. */
export type CourseDetail = ICourseEnrollmentDetail
export type JoinedCourse = IJoinedCourse
export type CourseCreator = ICourseCreator
export type CourseSummary = ICourseSummary
export type CourseReview = ICourseReview
export type EnrollmentInvoice = IEnrollmentInvoice
export type EnrollmentSummary = IEnrollmentSummary
export type ReviewSummary = IReviewSummary
