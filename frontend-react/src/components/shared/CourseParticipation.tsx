import { useEffect, useMemo, useState } from 'react'
import { BarChart3, ClipboardList, Users } from 'lucide-react'
import type { IMentorCourseStudent } from '../../lib/types/course'
import { Initials } from '../../lib/func/func'
import { Pagination } from './Pagination'
import { AttendanceBar, ProgressBar } from '../ui/bar'

type CourseParticipantsSectionProps = {
  courseUid: string
  studentsData: IMentorCourseStudent[]
}

export function CourseParticipantsSection({ courseUid, studentsData }: CourseParticipantsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [courseUid])

  const totalPages = Math.max(1, Math.ceil(studentsData.length / 8))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * 8
    return studentsData.slice(start, start + 8)
  }, [studentsData, currentPage])

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-transparent p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Peserta kursus</h2>
          <p className="mt-1 text-sm text-slate-500">Lihat daftar peserta yang sudah bergabung pada kursus ini.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          <Users className="size-3.5" />
          {studentsData.length} peserta
        </span>
      </div>

      {studentsData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center text-sm text-slate-500">Belum ada peserta terdaftar untuk kursus ini.</div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200/70 md:block">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Siswa</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <BarChart3 className="size-3.5" />
                      Progress
                    </span>
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <ClipboardList className="size-3.5" />
                      Kehadiran
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.uid} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {student.avatar ? (
                          <img src={student.avatar} width={36} height={36} loading="lazy" alt={student.name} className="size-9 rounded-full object-cover ring-1 ring-slate-100" />
                        ) : (
                          <span className="flex size-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{Initials(student.name)}</span>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">{student.name}</p>
                          {student.email && <p className="truncate text-xs text-slate-500">{student.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ProgressBar value={student.progressPercent} />
                    </td>
                    <td className="px-5 py-4">
                      <AttendanceBar student={student} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="flex flex-col gap-3 md:hidden">
            {paginatedStudents.map((student) => (
              <li key={student.uid} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <div className="flex items-start gap-3">
                  {student.avatar ? (
                    <img src={student.avatar} width={40} height={40} loading="lazy" alt={student.name} className="size-10 rounded-full object-cover ring-1 ring-slate-100" />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">{Initials(student.name)}</span>
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
