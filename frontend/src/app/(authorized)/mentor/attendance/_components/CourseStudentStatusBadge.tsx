import { Badge, type AppBadgeVariant } from '@/components/ui/badge'
import type { MentorCourseStudentStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CourseStatusIcon } from './AttendanceSessionIcons'

function statusToVariant(status: MentorCourseStudentStatus): AppBadgeVariant {
  switch (status) {
    case 'Aktif':
      return 'attendanceStudentActive'
    case 'Selesai':
      return 'attendanceStudentComplete'
    case 'Terlambat':
      return 'attendanceStudentLate'
    case 'Belum mulai':
      return 'attendanceStudentNotStarted'
    default:
      return 'attendanceStudentNotStarted'
  }
}

export function CourseStudentStatusBadge({
  status,
  className,
  compact,
}: {
  status: MentorCourseStudentStatus
  className?: string
  /** Kartu mobile: teks sedikit lebih kecil */
  compact?: boolean
}) {
  const v = statusToVariant(status)
  return (
    <Badge
      variant={v}
      className={cn('inline-flex items-center gap-1.5', compact && 'px-2 py-0.5 text-[10px]', className)}>
      <CourseStatusIcon status={status} />
      {status}
    </Badge>
  )
}
