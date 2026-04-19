'use client'

import { useState } from 'react'
import { BarChart3, CheckCircle2, ClipboardList, FileText, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
  IMentorAttendanceSessionState,
  IMentorCourseStudent,
  MentorAttendanceApprovalMode,
} from '@/lib/types'
import { AjuanActionsCell } from './AjuanActionsCell'
import { AttendanceRateBar, MaterialProgressBar } from './AttendanceMetricBars'
import type { AttendanceSessionRow } from './attendanceShared'
import { hasLeaveForSession, initials } from './attendanceShared'
import { CourseStudentStatusBadge } from './CourseStudentStatusBadge'
import { LeaveDetailModal } from './LeaveDetailModal'
import { SessionAttendanceDropdown } from './SessionAttendanceDropdown'
import { useMentorAttendanceStudentActions } from './useMentorAttendanceStudentActions'
import Image from 'next/image';

type CourseStudentMobileCardProps = {
  student: IMentorCourseStudent
  courseUid: string
  isoDate: string
  approvalMode: MentorAttendanceApprovalMode
  row?: AttendanceSessionRow
  onRefresh: () => void
}

export function CourseStudentMobileCard({
  student,
  courseUid,
  isoDate,
  approvalMode,
  row,
  onRefresh,
}: CourseStudentMobileCardProps) {
  const [leaveOpen, setLeaveOpen] = useState(false)
  const effective = row?.effective ?? 'belum'
  const pending = row?.pendingKind ?? null
  const showLeaveBtn = hasLeaveForSession(row)
  const actions = useMentorAttendanceStudentActions(courseUid, isoDate, student.uid, onRefresh)

  return (
    <li className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <LeaveDetailModal open={leaveOpen} onOpenChange={setLeaveOpen} studentName={student.name} isoDate={isoDate} />
      <div className="flex items-start gap-3">
        {student.avatar ? (
          <Image src={student.avatar} width={40} height={40} loading="lazy" alt="" className="size-10 shrink-0 rounded-full object-cover ring-1 ring-slate-100" />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            {initials(student.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{student.name}</p>
          {student.email && <p className="truncate text-xs text-slate-500">{student.email}</p>}
          <div className="mt-3 space-y-1">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden />
              Progress materi
            </p>
            <MaterialProgressBar percent={student.progressPercent} />
          </div>
          <div className="mt-3 space-y-1">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              Kehadiran
            </p>
            <AttendanceRateBar present={student.attendancePresent} total={student.attendanceTotal} />
          </div>
          <div className="mt-3 flex justify-end">
            <CourseStudentStatusBadge status={student.status} compact />
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              Absensi sesi
            </p>
            <SessionAttendanceDropdown value={effective} onChange={actions.setEffective} fullWidth />
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <Inbox className="h-3.5 w-3.5" aria-hidden />
              Ajuan
            </p>
            <AjuanActionsCell
              layout="card"
              approvalMode={approvalMode}
              pending={pending}
              onApprove={actions.onApprove}
              onReject={actions.onReject}
            />
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Izin
            </p>
            {showLeaveBtn ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 border-slate-200 shadow-none"
                title="Lihat izin"
                aria-label="Lihat izin"
                onClick={() => setLeaveOpen(true)}>
                <FileText className="h-4 w-4 text-sky-700" />
              </Button>
            ) : (
              <span className="text-sm text-slate-400">—</span>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

type CourseStudentMobileListProps = {
  courseUid: string
  isoDate: string
  approvalMode: MentorAttendanceApprovalMode
  session: IMentorAttendanceSessionState
  students: IMentorCourseStudent[]
  onRefresh: () => void
}

export function CourseStudentMobileList({
  courseUid,
  isoDate,
  approvalMode,
  session,
  students,
  onRefresh,
}: CourseStudentMobileListProps) {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {students.map((s) => (
        <CourseStudentMobileCard
          key={s.uid}
          student={s}
          isoDate={isoDate}
          courseUid={courseUid}
          approvalMode={approvalMode}
          row={session.byStudent[s.uid]}
          onRefresh={onRefresh}
        />
      ))}
    </ul>
  )
}
