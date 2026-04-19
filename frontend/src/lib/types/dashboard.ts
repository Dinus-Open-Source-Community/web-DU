import type { BadgeVariant } from './course'
import type { AdminPermissionGroup, AdminRole, AdminTransaction } from './admin'
import type { IMentorStats } from './mentor'
import type { TransactionHistoryItem } from './transaction'

/** Widget dashboard siswa/mentor (seed / API dashboard). */

export interface IDashboardStat {
  label: string
  value: number | string
  iconName: 'Book' | 'ClipboardCheck' | 'Award' | 'CheckCircle'
}

export interface IResumeCourse {
  title: string
  module: string
  progress: number
  image?: string
  description?: string
  variantBadge?: BadgeVariant
  /** Jika diisi, kartu "Lanjut" menuju preview modul kursus ini */
  courseUid?: string
  author?: {
    name: string
    avatar: string
  }
  rating?: number
  totalReviews?: number
}

export interface IDeadlineItem {
  month: string
  day: string
  title: string
  course: string
  isPast?: boolean
}

export interface IFeedbackItem {
  status: 'Lulus' | 'Perlu Revisi'
  time: string
  title: string
  comment: string
  instructor: {
    name: string
    avatar: string
  }
}

export interface DashboardData {
  stats: IDashboardStat[]
  resumeCourses: IResumeCourse[]
  deadlines: IDeadlineItem[]
  feedbacks: IFeedbackItem[]
  profile: {
    uid: string
    name: string
    email: string
    role: string
    avatar: string
    lastUpdated: string
  }
  mentorStats: IMentorStats
}

export interface TransactionsData {
  recent: TransactionHistoryItem[]
  history: TransactionHistoryItem[]
  admin: AdminTransaction[]
}

export interface RbacData {
  permissionGroups: AdminPermissionGroup[]
  roles: AdminRole[]
}
