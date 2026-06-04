import type { LucideIcon } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import type { ClassType, CourseStatus, ICourseItem } from './course'
import type { PaymentStatus } from './transaction'
import type { EnrollmentStatus, IMentor } from './user'

export type FilterSelectOption<T extends string = string> = { value: T; label: string }

export type SegmentedItem<T extends string = string> = { value: T; label: string }

export type SegmentedFilterVariant = 'scroll' | 'wrap'

export interface NavChildItem {
  name: string
  path: string
}

export interface NavItem {
  name: string
  path?: string
  icon?: LucideIcon
  children?: NavChildItem[]
}

export interface IProgramFeatures {
  title: string
  description: string
  icon: ReactNode
}

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
  status: CourseStatus
  mentor_uid: string
  mentors: IMentor[]
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
  // Transaction-specific props
  transactionId?: string
  classType?: string
  paymentStatus?: PaymentStatus
  paymentMethod?: string
  purchasedAt?: string
  detailHref?: string
  /** Variant `resume`: tautan tombol Lanjut / Lihat kursus */
  resumeDetailHref?: string
  /** Variant `mentorCourse`: subtitle di bawah judul */
  mentorHeader?: string
  mentorPublished?: boolean
  mentorModuleCount?: number
  mentorStudentCount?: number
  /** Tombol Draf / Terbitkan — dipanggil saat mentor mengubah status */
  mentorOnStatusClick?: () => void
}

export type PersonSelectionItem = {
  uid: string
  name: string
  email: string
  avatar: string
  detail?: string
  meta?: ReactNode
}

/** Props data untuk komponen di `components/charts/` (Recharts). */

export interface TransactionRatioPoint {
  label: string
  value: number
  color?: string
}

export interface TopCoursePoint {
  label: string
  value: number
}

export interface NewUsersPoint {
  label: string
  value: number
}

export interface CategoryPoint {
  label: string
  value: number
}

export interface RevenuePoint {
  label: string
  value: number
}

export interface TimelinePoint {
  label: string
  [key: string]: string | number
}

export interface TimelineSeries {
  dataKey: string
  label: string
  color: string
}

export interface ISearchProps extends InputHTMLAttributes<HTMLInputElement> {
  showIcon?: boolean
  containerClassName?: string
}

export interface TransactionTimelinePoint {
  label: string
  paid: number
  pending: number
  failed: number
  [key: string]: string | number
}

export interface ChartRatioPoint {
  label: string
  value: number
  color: string
}

export interface ChartDataPoint {
  label: string
  value: number
}

export interface IMentorStats {
  pendingGrading: number
  unansweredQA: number
  activeStudents: number
  totalCourses: number
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

export type DeadlineUrgency = 'overdue' | 'due_soon' | 'ok' | 'closed'
