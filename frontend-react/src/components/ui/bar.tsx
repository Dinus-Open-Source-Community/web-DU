import type { IMentorCourseStudent } from '../../lib/types/course'

export const ProgressBar = ({ value }: { value: number }) => {
  const normalized = Math.max(0, Math.min(100, value))
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary" style={{ width: `${normalized}%` }} />
      </div>
      <p className="text-xs font-medium tabular-nums text-slate-500">{normalized}%</p>
    </div>
  )
}

export const AttendanceBar = ({ student }: { student: IMentorCourseStudent }) => {
  const total = Math.max(1, student.student_attendance_total)
  const value = Math.round((student.student_attendance_present / total) * 100)
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
      <p className="text-xs font-medium tabular-nums text-slate-500">
        {student.student_attendance_present}/{student.student_attendance_total}
      </p>
    </div>
  )
}
