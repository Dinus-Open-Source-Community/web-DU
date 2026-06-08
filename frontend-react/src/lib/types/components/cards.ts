import type { ReactNode } from 'react'
import type { CourseCatalogStatus, ClassType, EnrollmentStatus } from '../common/domain'
import type { ICourseItem } from '../data/course'
import type { PaymentStatus } from '../common/domain'
import type { IAuthorCourseItem, IMentor } from '../data/user'

export interface ICardData {
  uid: string
  title: string
  subtitle: string
  description: string
  category_uid: string
  course_type_uid: string
  cover_url: string
  thumbnail_url: string
  price: number
  price_strike?: number
  level: string
  is_premium: boolean
  is_published: boolean
  status: CourseCatalogStatus
  mentor_uid: string
  mentors: IMentor[]
  created_by?: IAuthorCourseItem
  slot: number
  slug: string
  event_uid?: string | null
  what_you_learn: string[]
  created_at: string
  updated_at: string
}

export interface ICardProps extends ICourseItem {
  variant?: 'course' | 'resume' | 'resumeAdmin' | 'transaction' | 'mentorCourse'
  size?: 'sm' | 'md' | 'lg'
  module?: string
  progress?: number
  isEnrolled?: boolean
  enrollment_status?: EnrollmentStatus
  transactionId?: string
  classType?: string
  paymentStatus?: PaymentStatus
  paymentMethod?: string
  purchasedAt?: string
  detailHref?: string
  resumeDetailHref?: string
  mentorHeader?: string
  mentorPublished?: boolean
  mentorModuleCount?: number
  mentorStudentCount?: number
  mentorOnStatusClick?: () => void
}

export interface IProgramFeatures {
  title: string
  description: string
  icon: ReactNode
}

export interface IScheduleItem {
  uid: string
  courseId: string
  courseName: string
  scheduleDate: string
  scheduleTime: string
  endTime: string
  location: string
  classType: ClassType
  studentCount: number
}

export interface IMentorStats {
  pendingGrading: number
  unansweredQA: number
  activeStudents: number
  totalCourses: number
}
