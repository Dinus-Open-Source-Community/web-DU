import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  CircleDashed,
  FileText,
  Hourglass,
  XCircle,
} from 'lucide-react'
import type { MentorCourseStudentStatus, MentorSessionAttendanceStatus } from '@/lib/types'

export function SessionStatusIcon({
  status,
  className,
}: {
  status: MentorSessionAttendanceStatus
  className?: string
}) {
  const base = 'h-4 w-4 shrink-0'
  switch (status) {
    case 'belum':
      return <CircleDashed className={`${base} text-slate-400 ${className ?? ''}`} aria-hidden />
    case 'hadir':
      return <CheckCircle2 className={`${base} text-emerald-600 ${className ?? ''}`} aria-hidden />
    case 'izin':
      return <FileText className={`${base} text-sky-600 ${className ?? ''}`} aria-hidden />
    case 'alpha':
      return <XCircle className={`${base} text-rose-500 ${className ?? ''}`} aria-hidden />
    default:
      return <CircleDashed className={`${base} ${className ?? ''}`} aria-hidden />
  }
}

export function CourseStatusIcon({ status, className }: { status: MentorCourseStudentStatus; className?: string }) {
  const base = 'h-3 w-3 shrink-0 opacity-90'
  switch (status) {
    case 'Aktif':
      return <Activity className={`${base} ${className ?? ''}`} aria-hidden />
    case 'Selesai':
      return <Award className={`${base} ${className ?? ''}`} aria-hidden />
    case 'Terlambat':
      return <AlertTriangle className={`${base} ${className ?? ''}`} aria-hidden />
    case 'Belum mulai':
      return <Hourglass className={`${base} ${className ?? ''}`} aria-hidden />
    default:
      return null
  }
}
