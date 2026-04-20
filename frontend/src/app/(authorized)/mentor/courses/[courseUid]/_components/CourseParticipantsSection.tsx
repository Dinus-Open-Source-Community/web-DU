'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { BarChart3, ClipboardList, Users } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { getMentorCourseStudents } from '@/lib/mentorCourseStudents'
import type { IMentorCourseStudent, MentorCourseStudentStatus } from '@/lib/types'

const PAGE_SIZE = 8

const STATUS_CLASS: Record<MentorCourseStudentStatus, string> = {
  Aktif: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Selesai: 'border-blue-200 bg-blue-50 text-blue-700',
  Terlambat: 'border-amber-200 bg-amber-50 text-amber-700',
  'Belum mulai': 'border-slate-200 bg-slate-100 text-slate-600',
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function ProgressBar({ value }: { value: number }) {
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

function AttendanceBar({ student }: { student: IMentorCourseStudent }) {
  const total = Math.max(1, student.attendanceTotal)
  const value = Math.round((student.attendancePresent / total) * 100)
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
      <p className="text-xs font-medium tabular-nums text-slate-500">
        {student.attendancePresent}/{student.attendanceTotal}
      </p>
    </div>
  )
}

function StudentStatusBadge({ status }: { status: MentorCourseStudentStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_CLASS[status]}`}>{status}</span>
}

type CourseParticipantsSectionProps = {
  courseUid: string
}

export function CourseParticipantsSection({ courseUid }: CourseParticipantsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const students = useMemo(() => getMentorCourseStudents(courseUid), [courseUid])

  useEffect(() => {
    setCurrentPage(1)
  }, [courseUid])

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return students.slice(start, start + PAGE_SIZE)
  }, [students, currentPage])

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">Peserta kursus</h2>
          <p className="mt-1 text-sm text-slate-500">Lihat daftar peserta yang sudah bergabung pada kursus ini.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          <Users className="size-3.5" />
          {students.length} peserta
        </span>
      </div>

      {students.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center text-sm text-slate-500">Belum ada peserta terdaftar untuk kursus ini.</div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200/80 md:block">
            <table className="min-w-190 w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Siswa</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <BarChart3 className="size-3.5" />
                      Progress
                    </span>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <ClipboardList className="size-3.5" />
                      Kehadiran
                    </span>
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.uid} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {student.avatar ? (
                          <Image src={student.avatar} width={36} height={36} loading="lazy" alt={student.name} className="size-9 rounded-full object-cover ring-1 ring-slate-100" />
                        ) : (
                          <span className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{initials(student.name)}</span>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{student.name}</p>
                          {student.email && <p className="truncate text-xs text-slate-500">{student.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <ProgressBar value={student.progressPercent} />
                    </td>
                    <td className="px-4 py-3.5">
                      <AttendanceBar student={student} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StudentStatusBadge status={student.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden">
            {paginatedStudents.map((student) => (
              <li key={student.uid} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <div className="flex items-start gap-3">
                  {student.avatar ? (
                    <Image src={student.avatar} width={40} height={40} loading="lazy" alt={student.name} className="size-10 rounded-full object-cover ring-1 ring-slate-100" />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{initials(student.name)}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{student.name}</p>
                    {student.email && <p className="truncate text-xs text-slate-500">{student.email}</p>}
                    <div className="mt-3 space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Progress</p>
                      <ProgressBar value={student.progressPercent} />
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Kehadiran</p>
                      <AttendanceBar student={student} />
                    </div>
                    <div className="mt-3 flex justify-end">
                      <StudentStatusBadge status={student.status} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </>
      )}
    </div>
  )
}
