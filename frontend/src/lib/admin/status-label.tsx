import type { ReactNode } from 'react'

import { resolveParticipantEnrollmentStatus } from '@/lib/course-detail/participant-enrollment-status'
import type { AdminStatus } from '@/lib/types/user'
import type { AttendanceStatusValue } from '@/lib/types/features/course-detail-assignments'
import { cn } from '@/lib/utils'

export type AdminStatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const toneDotClass: Record<AdminStatusTone, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-destructive',
  info: 'bg-sky-500',
  neutral: 'bg-ink-400',
}

export function AdminStatusLabel({
  tone,
  children,
  className,
}: {
  tone: AdminStatusTone
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs font-medium text-ink-700', className)}>
      <span className={cn('size-1.5 shrink-0 rounded-full', toneDotClass[tone])} aria-hidden />
      {children}
    </span>
  )
}

export function AdminMetaLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <span className={cn('text-xs font-medium text-ink-500', className)}>{children}</span>
}

const USER_STATUS: Record<AdminStatus, { tone: AdminStatusTone; label: string }> = {
  active: { tone: 'success', label: 'Aktif' },
  inactive: { tone: 'neutral', label: 'Nonaktif' },
  pending: { tone: 'warning', label: 'Menunggu verifikasi' },
}

export function AdminUserStatusLabel({ status }: { status: AdminStatus }) {
  const { tone, label } = USER_STATUS[status]
  return <AdminStatusLabel tone={tone}>{label}</AdminStatusLabel>
}

const SEVERITY: Record<'high' | 'medium' | 'low', { tone: AdminStatusTone; label: string }> = {
  high: { tone: 'danger', label: 'High' },
  medium: { tone: 'warning', label: 'Medium' },
  low: { tone: 'info', label: 'Low' },
}

export function AdminSeverityLabel({ severity }: { severity: 'high' | 'medium' | 'low' }) {
  const { tone, label } = SEVERITY[severity]
  return <AdminStatusLabel tone={tone}>{label}</AdminStatusLabel>
}

export function AdminQaStatusLabel({ answered }: { answered: boolean }) {
  return (
    <AdminStatusLabel tone={answered ? 'success' : 'warning'}>
      {answered ? 'Terjawab' : 'Belum dijawab'}
    </AdminStatusLabel>
  )
}

export function AdminPublishStatusLabel({ published }: { published: boolean }) {
  return (
    <AdminStatusLabel tone={published ? 'success' : 'warning'}>
      {published ? 'Terbit' : 'Draft'}
    </AdminStatusLabel>
  )
}

export function AdminActiveStatusLabel({ active }: { active: boolean }) {
  return (
    <AdminStatusLabel tone={active ? 'success' : 'neutral'}>
      {active ? 'Aktif' : 'Nonaktif'}
    </AdminStatusLabel>
  )
}

export function resolveParticipantStatus(status?: string): { tone: AdminStatusTone; label: string } {
  return resolveParticipantEnrollmentStatus(status)
}

export function AdminParticipantStatusLabel({ status }: { status?: string }) {
  const { tone, label } = resolveParticipantStatus(status)
  return <AdminStatusLabel tone={tone}>{label}</AdminStatusLabel>
}

const ATTENDANCE_STATUS: Record<AttendanceStatusValue, { tone: AdminStatusTone; label: string }> = {
  present: { tone: 'success', label: 'Hadir' },
  late: { tone: 'warning', label: 'Terlambat' },
  absent: { tone: 'danger', label: 'Tidak hadir' },
  excused: { tone: 'info', label: 'Izin' },
}

export function AdminAttendanceStatusLabel({ status }: { status: AttendanceStatusValue }) {
  const { tone, label } = ATTENDANCE_STATUS[status]
  return <AdminStatusLabel tone={tone}>{label}</AdminStatusLabel>
}

export function AdminTaskTypeLabel({ taskType }: { taskType: 'quiz' | 'text' }) {
  const isQuiz = taskType === 'quiz'
  return <AdminStatusLabel tone={isQuiz ? 'info' : 'neutral'}>{isQuiz ? 'Kuis' : 'Teks'}</AdminStatusLabel>
}
