'use client'

import { useState } from 'react'
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileText,
  Inbox,
  Users,
} from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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

type CourseStudentsTableProps = {
  courseUid: string
  isoDate: string
  approvalMode: MentorAttendanceApprovalMode
  session: IMentorAttendanceSessionState
  students: IMentorCourseStudent[]
  onRefresh: () => void
}

function StudentTableRow({
  student,
  courseUid,
  isoDate,
  approvalMode,
  row,
  onRefresh,
}: {
  student: IMentorCourseStudent
  courseUid: string
  isoDate: string
  approvalMode: MentorAttendanceApprovalMode
  row?: AttendanceSessionRow
  onRefresh: () => void
}) {
  const [leaveOpen, setLeaveOpen] = useState(false)
  const effective = row?.effective ?? 'belum'
  const pending = row?.pendingKind ?? null
  const showLeaveBtn = hasLeaveForSession(row)
  const actions = useMentorAttendanceStudentActions(courseUid, isoDate, student.uid, onRefresh)

  return (
    <>
      <LeaveDetailModal open={leaveOpen} onOpenChange={setLeaveOpen} studentName={student.name} isoDate={isoDate} />
      <TableRow className="border-slate-100 transition-colors hover:bg-slate-50/50">
        <TableCell className="px-4 py-3.5 align-middle whitespace-normal">
          <div className="flex items-center gap-3">
            {student.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.avatar} alt="" className="size-9 shrink-0 rounded-full object-cover ring-1 ring-slate-100" />
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                {initials(student.name)}
              </span>
            )}
            <div className="min-w-0">
              <p className="font-medium text-slate-900">{student.name}</p>
              {student.email && <p className="truncate text-xs text-slate-500">{student.email}</p>}
            </div>
          </div>
        </TableCell>
        <TableCell className="px-4 py-3.5 align-middle whitespace-normal">
          <MaterialProgressBar percent={student.progressPercent} />
        </TableCell>
        <TableCell className="px-4 py-3.5 align-middle whitespace-normal">
          <AttendanceRateBar present={student.attendancePresent} total={student.attendanceTotal} />
        </TableCell>
        <TableCell className="px-4 py-3.5 align-middle whitespace-normal">
          <CourseStudentStatusBadge status={student.status} />
        </TableCell>
        <TableCell className="px-4 py-3.5 align-middle whitespace-normal">
          <SessionAttendanceDropdown value={effective} onChange={actions.setEffective} />
        </TableCell>
        <TableCell className="px-4 py-3.5 align-middle whitespace-normal">
          <AjuanActionsCell
            layout="table"
            approvalMode={approvalMode}
            pending={pending}
            onApprove={actions.onApprove}
            onReject={actions.onReject}
          />
        </TableCell>
        <TableCell className="px-4 py-3.5 align-middle text-center whitespace-normal">
          {showLeaveBtn ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mx-auto h-9 w-9 border-slate-200 shadow-none"
              title="Lihat izin"
              aria-label="Lihat izin"
              onClick={() => setLeaveOpen(true)}>
              <FileText className="h-4 w-4 text-sky-700" />
            </Button>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </TableCell>
      </TableRow>
    </>
  )
}

export function CourseStudentsTable({
  courseUid,
  isoDate,
  approvalMode,
  session,
  students,
  onRefresh,
}: CourseStudentsTableProps) {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:block">
      <Table className="min-w-[920px] table-fixed">
        <TableHeader>
          <TableRow className="border-slate-100 bg-slate-50/90 hover:bg-slate-50/90">
            <TableHead className="w-[20%] px-4 py-3.5">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <Users className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                Siswa
              </span>
            </TableHead>
            <TableHead className="px-4 py-3.5">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <BarChart3 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                Progress
              </span>
            </TableHead>
            <TableHead className="px-4 py-3.5">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <ClipboardList className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                Kehadiran
              </span>
            </TableHead>
            <TableHead className="px-4 py-3.5">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <Activity className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                Status
              </span>
            </TableHead>
            <TableHead className="px-4 py-3.5">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                Absensi
              </span>
            </TableHead>
            <TableHead className="px-4 py-3.5">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <Inbox className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                Ajuan
              </span>
            </TableHead>
            <TableHead className="w-[100px] px-4 py-3.5 text-center">
              <span className="inline-flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <FileText className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                Izin
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((s) => (
            <StudentTableRow
              key={s.uid}
              student={s}
              isoDate={isoDate}
              courseUid={courseUid}
              approvalMode={approvalMode}
              row={session.byStudent[s.uid]}
              onRefresh={onRefresh}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
