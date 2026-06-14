import type { IMentorCourseStudent } from '../../lib/types/course'
import { formatLearningProgressLabel, toLearningProgressPercent } from '@/lib/learning/progress'

export const ProgressBar = ({ value }: { value: number }) => {
  const normalized = toLearningProgressPercent(value)
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary" style={{ width: `${normalized}%` }} />
      </div>
      <p className="text-xs font-medium tabular-nums text-slate-500">{formatLearningProgressLabel(value)}</p>
    </div>
  )
}

export const AttendanceBar = ({ student }: { student: IMentorCourseStudent }) => {
  const total = Math.max(1, student.student_attendance_total ?? 0)
  const present = student.student_attendance_present ?? 0
  const value = Math.round((present / total) * 100)
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
      <p className="text-xs font-medium tabular-nums text-slate-500">
        {present}/{total}
      </p>
    </div>
  )
}
