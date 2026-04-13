'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pagination } from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getMentorCourseStudents } from '@/lib/mentorCourseStudents'
import type {
  IMentorAttendanceSessionState,
  IMentorCourseStudent,
  MentorAttendanceApprovalMode,
  MentorCourseStudentStatus,
  MentorSessionAttendanceStatus,
} from '@/lib/types'
import {
  approveMentorStudentPending,
  rejectMentorStudentPending,
  setMentorStudentEffectiveStatus,
  submitStudentAttendanceRequest,
} from '@/lib/mentorAttendanceStorage'

const PAGE_SIZE = 8

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function statusClass(status: MentorCourseStudentStatus) {
  switch (status) {
    case 'Aktif':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    case 'Selesai':
      return 'border-sky-200 bg-sky-50 text-sky-800'
    case 'Terlambat':
      return 'border-amber-200 bg-amber-50 text-amber-900'
    case 'Belum mulai':
      return 'border-slate-200 bg-slate-100 text-slate-600'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700'
  }
}

function sessionLabel(s: MentorSessionAttendanceStatus) {
  switch (s) {
    case 'belum':
      return 'Belum'
    case 'hadir':
      return 'Hadir'
    case 'izin':
      return 'Izin'
    case 'alpha':
      return 'Alpha'
    default:
      return s
  }
}

export type CourseStudentsSectionProps = {
  courseUid: string
  isoDate: string
  approvalMode: MentorAttendanceApprovalMode
  session: IMentorAttendanceSessionState
  onRefresh: () => void
}

export function CourseStudentsSection({ courseUid, isoDate, approvalMode, session, onRefresh }: CourseStudentsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const students = useMemo(() => getMentorCourseStudents(courseUid), [courseUid])

  useEffect(() => {
    setCurrentPage(1)
  }, [courseUid, isoDate])

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return students.slice(start, start + PAGE_SIZE)
  }, [students, currentPage])

  return (
    <div className="min-w-0 w-full">
      <div className="mb-4">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">Peserta kursus</h3>
        <p className="mt-1 text-sm text-slate-500">Kelola kehadiran sesi terpilih dan status peserta.</p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center text-sm text-slate-500">Belum ada peserta terdaftar untuk kursus ini.</div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200/90 bg-white md:block">
            <Table className="min-w-[900px] table-fixed">
              <TableHeader>
                <TableRow className="border-slate-100 bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="w-[22%] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Siswa</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Progress</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Kehadiran</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Absensi sesi</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Ajuan</TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Terakhir aktif</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((s) => (
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

          <ul className="flex flex-col gap-3 md:hidden">
            {paginated.map((s) => (
              <StudentCard
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

          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </>
      )}
    </div>
  )
}

type RowProps = {
  student: IMentorCourseStudent
  courseUid: string
  isoDate: string
  approvalMode: MentorAttendanceApprovalMode
  row?: { effective: MentorSessionAttendanceStatus; pendingKind: 'hadir' | 'izin' | null }
  onRefresh: () => void
}

function StudentTableRow({ student, courseUid, isoDate, approvalMode, row, onRefresh }: RowProps) {
  const effective = row?.effective ?? 'belum'
  const pending = row?.pendingKind ?? null

  const setEffective = (v: MentorSessionAttendanceStatus) => {
    setMentorStudentEffectiveStatus(courseUid, isoDate, student.uid, v)
    onRefresh()
  }

  const onApprove = () => {
    approveMentorStudentPending(courseUid, isoDate, student.uid)
    onRefresh()
  }

  const onReject = () => {
    rejectMentorStudentPending(courseUid, isoDate, student.uid)
    onRefresh()
  }

  const onSimHadir = () => {
    submitStudentAttendanceRequest(courseUid, isoDate, student.uid, 'hadir')
    onRefresh()
  }

  const onSimIzin = () => {
    submitStudentAttendanceRequest(courseUid, isoDate, student.uid, 'izin')
    onRefresh()
  }

  return (
    <TableRow className="border-slate-100">
      <TableCell className="px-4 py-3 align-middle whitespace-normal">
        <div className="flex items-center gap-3">
          {student.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={student.avatar} alt="" className="size-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{initials(student.name)}</span>
          )}
          <div className="min-w-0">
            <p className="font-medium text-slate-900">{student.name}</p>
            {student.email && <p className="truncate text-xs text-slate-500">{student.email}</p>}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle whitespace-normal">
        <ProgressCell percent={student.progressPercent} />
      </TableCell>
      <TableCell className="px-4 py-3 align-middle whitespace-normal">
        <AttendanceProgressCell present={student.attendancePresent} total={student.attendanceTotal} />
      </TableCell>
      <TableCell className="px-4 py-3 align-middle whitespace-normal">
        <span className={cn('inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide', statusClass(student.status))}>{student.status}</span>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle whitespace-normal">
        <select
          value={effective}
          onChange={(e) => setEffective(e.target.value as MentorSessionAttendanceStatus)}
          className="max-w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary">
          {(['belum', 'hadir', 'izin', 'alpha'] as const).map((v) => (
            <option key={v} value={v}>
              {sessionLabel(v)}
            </option>
          ))}
        </select>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle whitespace-normal">
        <div className="flex flex-col gap-2">
          {pending ? (
            <span className="inline-flex w-fit rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900">Menunggu: {pending === 'hadir' ? 'hadir' : 'izin'}</span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
          {approvalMode === 'review' && pending ? (
            <div className="flex flex-wrap gap-1.5">
              <Button type="button" size="sm" variant="outline" className="h-7 rounded-md px-2 text-[11px] shadow-none" onClick={onApprove}>
                Terima
              </Button>
              <Button type="button" size="sm" variant="ghost" className="h-7 rounded-md px-2 text-[11px] text-slate-600 shadow-none" onClick={onReject}>
                Tolak
              </Button>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-1">
            <Button type="button" size="sm" variant="ghost" className="h-7 rounded-md px-2 text-[10px] text-slate-500 shadow-none" onClick={onSimHadir}>
              Simulasi ajuan hadir
            </Button>
            <Button type="button" size="sm" variant="ghost" className="h-7 rounded-md px-2 text-[10px] text-slate-500 shadow-none" onClick={onSimIzin}>
              Simulasi izin
            </Button>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-600 whitespace-normal">{student.lastActiveLabel}</TableCell>
    </TableRow>
  )
}

function StudentCard({ student, courseUid, isoDate, approvalMode, row, onRefresh }: RowProps) {
  const effective = row?.effective ?? 'belum'
  const pending = row?.pendingKind ?? null

  const setEffective = (v: MentorSessionAttendanceStatus) => {
    setMentorStudentEffectiveStatus(courseUid, isoDate, student.uid, v)
    onRefresh()
  }

  const onApprove = () => {
    approveMentorStudentPending(courseUid, isoDate, student.uid)
    onRefresh()
  }

  const onReject = () => {
    rejectMentorStudentPending(courseUid, isoDate, student.uid)
    onRefresh()
  }

  const onSimHadir = () => {
    submitStudentAttendanceRequest(courseUid, isoDate, student.uid, 'hadir')
    onRefresh()
  }

  const onSimIzin = () => {
    submitStudentAttendanceRequest(courseUid, isoDate, student.uid, 'izin')
    onRefresh()
  }

  return (
    <li className="rounded-2xl border border-slate-200/90 bg-white p-4">
      <div className="flex items-start gap-3">
        {student.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={student.avatar} alt="" className="size-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{initials(student.name)}</span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{student.name}</p>
          {student.email && <p className="truncate text-xs text-slate-500">{student.email}</p>}
          <div className="mt-3 space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Progress materi</p>
            <ProgressCell percent={student.progressPercent} />
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Kehadiran</p>
            <AttendanceProgressCell present={student.attendancePresent} total={student.attendanceTotal} />
          </div>
          <div className="mt-3 flex justify-end">
            <span className={cn('inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', statusClass(student.status))}>{student.status}</span>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Absensi sesi</p>
            <select
              value={effective}
              onChange={(e) => setEffective(e.target.value as MentorSessionAttendanceStatus)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-800 outline-none">
              {(['belum', 'hadir', 'izin', 'alpha'] as const).map((v) => (
                <option key={v} value={v}>
                  {sessionLabel(v)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Ajuan</p>
            {pending ? (
              <p className="mt-1 text-xs text-amber-900">Menunggu: {pending === 'hadir' ? 'hadir' : 'izin'}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-400">—</p>
            )}
            {approvalMode === 'review' && pending ? (
              <div className="mt-2 flex gap-2">
                <Button type="button" size="sm" variant="outline" className="h-8 flex-1 rounded-lg text-xs shadow-none" onClick={onApprove}>
                  Terima
                </Button>
                <Button type="button" size="sm" variant="ghost" className="h-8 flex-1 rounded-lg text-xs shadow-none" onClick={onReject}>
                  Tolak
                </Button>
              </div>
            ) : null}
            <div className="mt-2 flex flex-col gap-1">
              <Button type="button" size="sm" variant="ghost" className="h-8 justify-start px-0 text-xs text-slate-500 shadow-none" onClick={onSimHadir}>
                Simulasi ajuan hadir
              </Button>
              <Button type="button" size="sm" variant="ghost" className="h-8 justify-start px-0 text-xs text-slate-500 shadow-none" onClick={onSimIzin}>
                Simulasi izin
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Terakhir aktif: {student.lastActiveLabel}</p>
        </div>
      </div>
    </li>
  )
}

function ProgressCell({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent))
  return (
    <div className="flex min-w-[100px] max-w-[180px] flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-primary" style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums text-slate-600">{clamped}%</span>
    </div>
  )
}

function AttendanceProgressCell({ present, total }: { present: number; total: number }) {
  const pct = total <= 0 ? 0 : Math.min(100, Math.round((present / total) * 100))
  return (
    <div className="flex min-w-[100px] max-w-[180px] flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500/90" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium tabular-nums text-slate-600">{pct}%</span>
    </div>
  )
}
