import type { ComponentProps, ReactNode } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { BadgeVariants } from '../../lib/variant'
import { AdminStatusLabel } from '@/lib/admin/status-label'
import { paymentStatusLabels, type PaymentStatus } from '../../lib/types/transaction'
import { cn } from '../../lib/utils'
import { formatParticipantEnrollmentStatus } from '@/lib/course-detail/participant-enrollment-status'
import type { BadgeVariant, ClassType, MentorCourseStudentStatus } from '../../lib/types/course'

export type AppBadgeVariant = NonNullable<VariantProps<typeof BadgeVariants>['variant']>

const defaultLabel: Partial<Record<AppBadgeVariant, string>> = {
  free: 'Gratis',
  premium: 'Premium',
  event: 'Event',
  draft: 'Draf',
  paymentPaid: paymentStatusLabels.success,
  paymentPending: paymentStatusLabels.pending,
  paymentFailed: paymentStatusLabels.failed,
  assignmentDraft: 'Draf',
  assignmentPublished: 'Terbit',
  assignmentClosed: 'Ditutup',
  deadlineOverdue: 'Lewat tenggat',
  deadlineDueSoon: 'Mendekati tenggat',
  reviewPending: 'Menunggu penilaian',
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
  courseParticipantActive: 'Aktif',
  courseParticipantComplete: 'Selesai',
  courseParticipantLate: 'Terlambat',
  courseParticipantNotStarted: 'Belum mulai',
  attendanceAjuanPending: 'Menunggu',
  severityHigh: 'Tinggi',
  severityMedium: 'Sedang',
  severityLow: 'Rendah',
  payoutRequested: 'Diminta',
  payoutApproved: 'Disetujui',
  payoutPaid: 'Dibayar',
  payoutRejected: 'Ditolak',
  auditCreate: 'CREATE',
  auditUpdate: 'UPDATE',
  auditDelete: 'DELETE',
  auditView: 'VIEW',
  couponActive: 'Aktif',
  couponExpired: 'Kedaluwarsa',
  couponScheduled: 'Terjadwal',
  coursePublished: 'Terbit',
  courseDraft: 'Draf',
  coursePending: 'Menunggu',
  courseRejected: 'Ditolak',
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

const paymentStatusTone: Record<PaymentStatus, 'success' | 'warning' | 'danger'> = {
  success: 'success',
  pending: 'warning',
  failed: 'danger',
}

/** Status pembayaran — `dot` untuk tabel admin (tanpa chip), default badge untuk area lain. */
export function PaymentBadge({
  status,
  className,
  presentation = 'badge',
}: {
  status: PaymentStatus
  className?: string
  presentation?: 'badge' | 'dot'
}) {
  if (presentation === 'dot') {
    return (
      <AdminStatusLabel tone={paymentStatusTone[status]} className={className}>
        {paymentStatusLabels[status]}
      </AdminStatusLabel>
    )
  }

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

function courseParticipantStatusVariant(status?: string): Extract<AppBadgeVariant, `courseParticipant${string}`> {
  const normalized = (status || '').trim().toLowerCase()

  if (normalized === 'selesai' || normalized === 'completed' || normalized === 'complete') {
    return 'courseParticipantComplete'
  }
  if (normalized === 'terlambat' || normalized === 'late') {
    return 'courseParticipantLate'
  }
  if (
    normalized === 'belum mulai' ||
    normalized === 'not_started' ||
    normalized === 'not started' ||
    normalized === 'registered' ||
    normalized === 'terdaftar' ||
    normalized === 'pending' ||
    normalized === 'menunggu' ||
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'dibatalkan'
  ) {
    return 'courseParticipantNotStarted'
  }

  return 'courseParticipantActive'
}

export function CourseParticipantStatusBadge({ status, className }: { status?: MentorCourseStudentStatus | string; className?: string }) {
  const label = formatParticipantEnrollmentStatus(status)

  return (
    <Badge variant={courseParticipantStatusVariant(status)} className={cn('max-w-full', className)}>
      <span className="truncate">{label}</span>
    </Badge>
  )
}

export type { VariantProps }
