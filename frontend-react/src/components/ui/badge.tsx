import type { ComponentProps, ReactNode } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { BadgeVariants } from '../../lib/variant'
import { paymentStatusLabels, type PaymentStatus } from '../../lib/types/transaction'
import { cn } from '../../lib/utils'
import type { BadgeVariant, ClassType } from '../../lib/types/course'

export type AppBadgeVariant = NonNullable<VariantProps<typeof BadgeVariants>['variant']>

const defaultLabel: Partial<Record<AppBadgeVariant, string>> = {
  free: 'Free',
  premium: 'Premium',
  event: 'Event',
  draft: 'Draft',
  paymentPaid: paymentStatusLabels.success,
  paymentPending: paymentStatusLabels.pending,
  paymentFailed: paymentStatusLabels.failed,
  assignmentDraft: 'Draf',
  assignmentPublished: 'Terbit',
  assignmentClosed: 'Ditutup',
  deadlineOverdue: 'Lewat tenggat',
  deadlineDueSoon: 'Mendekati tenggat',
  reviewPending: 'Menunggu review',
  reviewGraded: 'Selesai dinilai',
  reviewReturned: 'Minta revisi',
  demo: 'Demo',
  mentorLive: 'Aktif',
  mentorDraft: 'Draf',
  classOnline: 'online',
  classOffline: 'offline',
  progressComplete: 'Selesai',
  attendanceStudentActive: 'Aktif',
  attendanceStudentComplete: 'Selesai',
  attendanceStudentLate: 'Terlambat',
  attendanceStudentNotStarted: 'Belum mulai',
  attendanceAjuanPending: 'Menunggu',
  severityHigh: 'High',
  severityMedium: 'Medium',
  severityLow: 'Low',
  payoutRequested: 'Requested',
  payoutApproved: 'Approved',
  payoutPaid: 'Paid',
  payoutRejected: 'Rejected',
  auditCreate: 'CREATE',
  auditUpdate: 'UPDATE',
  auditDelete: 'DELETE',
  auditView: 'VIEW',
  couponActive: 'Aktif',
  couponExpired: 'Kedaluwarsa',
  couponScheduled: 'Terjadwal',
  coursePublished: 'Published',
  courseDraft: 'Draft',
  coursePending: 'Pending',
  courseRejected: 'Rejected',
  qaAnswered: 'Terjawab',
  qaUnanswered: 'Belum dijawab',
}

export type BadgeProps = {
  variant: AppBadgeVariant
  className?: string
  children?: ReactNode
} & ComponentProps<'span'>

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  const text = children ?? defaultLabel[variant]
  return (
    <span className={cn(BadgeVariants({ variant }), className)} {...props}>
      {text}
    </span>
  )
}

/** Kompatibilitas: varian kursus dari `BadgeVariant` (free | premium | event | draft) */
export function CourseBadge({ variant, className }: { variant: BadgeVariant; className?: string }) {
  return <Badge variant={variant} className={className} />
}

/** Status pembayaran dengan gaya badge aplikasi. */
export function PaymentBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  const v = status === 'success' ? 'paymentPaid' : status === 'pending' ? 'paymentPending' : 'paymentFailed'
  return (
    <Badge variant={v} className={className}>
      {paymentStatusLabels[status]}
    </Badge>
  )
}

/** Kalender: online / offline */
export function ClassTypeBadge({ classType, className }: { classType: ClassType; className?: string }) {
  const v = classType === 'online' ? 'classOnline' : 'classOffline'
  return (
    <Badge variant={v} className={className}>
      {classType}
    </Badge>
  )
}

export type { VariantProps }
