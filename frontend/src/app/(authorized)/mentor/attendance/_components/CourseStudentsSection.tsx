'use client'

import { useEffect, useMemo, useState } from 'react'
import { Pagination } from '@/components/ui/pagination'
import { getMentorCourseStudents } from '@/lib/mentorCourseStudents'
import type { IMentorAttendanceSessionState, MentorAttendanceApprovalMode } from '@/lib/types'
import { CourseStudentMobileList } from './CourseStudentMobileCard'
import { CourseStudentsTable } from './CourseStudentsTable'

const PAGE_SIZE = 8

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
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center text-sm text-slate-500">
          Belum ada peserta terdaftar untuk kursus ini.
        </div>
      ) : (
        <>
          <CourseStudentsTable
            courseUid={courseUid}
            isoDate={isoDate}
            approvalMode={approvalMode}
            session={session}
            students={paginated}
            onRefresh={onRefresh}
          />
          <CourseStudentMobileList
            courseUid={courseUid}
            isoDate={isoDate}
            approvalMode={approvalMode}
            session={session}
            students={paginated}
            onRefresh={onRefresh}
          />

          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </>
      )}
    </div>
  )
}
