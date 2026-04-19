import type { CourseCategory, ICardData } from './course'
import type { TransactionHistoryItem } from './transaction'

/** Admin: KPI, pengguna, tiket, kupon, audit, RBAC. */

export interface AdminKpi {
  id: string
  label: string
  value: string
  trendValue: number
  trendDirection: 'up' | 'down' | 'neutral'
  trendLabel: string
  iconName: 'revenue' | 'users' | 'transactions' | 'conversion' | 'ticket' | 'paid' | 'pending' | 'failed'
}

export interface AdminTicket {
  uid: string
  studentUid?: string
  subject: string
  studentName: string
  studentAvatar: string
  createdAt: string
  severity: 'high' | 'medium' | 'low'
  category: 'Payment' | 'Course Content' | 'Account' | 'Certificate' | 'Other'
}

export type AdminStatus = 'active' | 'inactive' | 'pending'

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

export interface StudentEnrolledCourse {
  uid: string
  courseUid?: string
  studentUid?: string
  title: string
  image: string
  module: string
  progress: number
}

export type MentorSpecialization = 'Development' | 'Design' | 'Data & AI' | 'Marketing' | 'Business' | 'Language'

export interface AdminMentor {
  uid: string
  name: string
  email: string
  avatar: string
  joinedAt: string
  totalCourses: number
  rating: number
  totalReviews: number
  status: AdminStatus
  specializations: MentorSpecialization[]
  bio?: string
  studentsCount: number
}

export interface AdminAdministrator {
  uid: string
  name: string
  email: string
  avatar: string
  role: 'Super Admin' | 'Admin' | 'Finance' | 'Content Moderator' | 'Support'
  lastActive: string
  status: AdminStatus
  createdAt: string
}

export type AdminCourse = ICardData

export interface AdminReview {
  uid: string
  courseUid: string
  studentUid?: string
  courseTitle: string
  studentName: string
  studentAvatar: string
  rating: number
  comment: string
  createdAt: string
  reply?: { author: string; comment: string; createdAt: string }
}

export interface AdminQaReply {
  uid: string
  author: string
  authorAvatar: string
  role: 'student' | 'mentor' | 'admin'
  body: string
  createdAt: string
}

export interface AdminQaThread {
  uid: string
  courseUid: string
  authorUid?: string
  courseTitle: string
  title: string
  author: string
  authorAvatar: string
  body: string
  createdAt: string
  repliesCount: number
  status: 'answered' | 'unanswered'
  replies: AdminQaReply[]
}

export interface AdminTransaction extends TransactionHistoryItem {
  studentName: string
  studentAvatar: string
}

export type PayoutStatus = 'requested' | 'approved' | 'paid' | 'rejected'

export interface AdminPayout {
  uid: string
  mentorUid: string
  mentorName: string
  mentorAvatar: string
  amount: number
  bankName: string
  accountNumber: string
  accountHolder: string
  requestedAt: string
  status: PayoutStatus
}

export type CouponType = 'percent' | 'flat'
export type CouponStatus = 'active' | 'expired' | 'scheduled'

export interface AdminCoupon {
  uid: string
  code: string
  type: CouponType
  value: number
  minPurchase: number
  usageLimit: number
  used: number
  startsAt: string
  endsAt: string
  status: CouponStatus
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'

export interface AdminAuditLog {
  uid: string
  timestamp: string
  actorName: string
  actorAvatar: string
  actorRole: string
  action: AuditAction
  resource: string
  resourceId: string
  ip: string
  detail: string
}

export interface AdminRole {
  uid: string
  name: string
  description: string
  membersCount: number
  permissions: string[]
}

export interface AdminPermissionGroup {
  group: string
  items: string[]
}

export interface IProgramFeatureData {
  title: string
  description: string
  iconName: 'book' | 'globe' | 'job' | 'certificate'
}

export interface AdminCategoryItem {
  uid: string
  name: CourseCategory
  coursesCount: number
  colorVariant: string
}
