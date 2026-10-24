import { useEffect, useState } from 'react'
import { BarChart3, CheckCircle, ClipboardList, Loader2, Users } from 'lucide-react'
import type { IMentorCourseStudent } from '../../lib/types/course'
import { Initials } from '../../lib/func/func'
import { TablePaginationFooter } from './TablePaginationFooter'
import { AttendanceBar, ProgressBar } from '../ui/bar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { AdminParticipantStatusLabel } from '@/lib/admin/status-label'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import { cn } from '@/lib/utils'
import { CourseParticipantStatusBadge } from '../ui/badge'
import { CourseDetailTabSectionIntro } from './course-detail-manage/CourseDetailTabSectionIntro'
import { useCourseStudents } from '@/hooks/use-course'
import { AddCourseParticipantDialog } from './AddCourseParticipantDialog'
import { useAuth } from '@/providers/auth-provider'

type CourseParticipantsSectionProps = {
  courseUid: string
  studentsData?: IMentorCourseStudent[]
  adminStatusLabels?: boolean
  canManageParticipants?: boolean
}

export function CourseParticipantsSection({
  courseUid,
  studentsData,
  adminStatusLabels = false,
  canManageParticipants = true,
}: CourseParticipantsSectionProps) {
  const { role } = useAuth()
  const isAuthorizedRole =
    role === 'super_admin' || role === 'admin' || role === 'mentor'
  const isManageAllowed = Boolean(canManageParticipants && isAuthorizedRole)

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setCurrentPage(1)
  }, [courseUid])

  const { data: studentsResponse, isLoading } = useCourseStudents(
    courseUid,
    { page: currentPage, per_page: pageSize },
  )

  const studentsList: IMentorCourseStudent[] =
    studentsResponse?.enrollments ??
    (studentsResponse ? [] : (studentsData ?? []))

  const totalCount =
    studentsResponse?.meta?.total ?? studentsData?.length ?? 0

  const totalPages =
    studentsResponse?.meta?.total_pages ??
    Math.max(1, Math.ceil(totalCount / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  return (
    <div className={cn(manageDetailLayout.sectionCard, manageDetailLayout.sectionPadding)}>
      <CourseDetailTabSectionIntro
        className="mb-4"
        icon={Users}
        title="Peserta Kursus"
        description="Lihat siswa yang terdaftar beserta status, kemajuan belajar, dan kehadiran."
        aside={
          isManageAllowed ? (
            <AddCourseParticipantDialog courseUid={courseUid} />
          ) : null
        }
      />

      {isLoading && !studentsResponse ? (
        <div className="flex h-48 items-center justify-center text-sm text-ink-500">
          <Loader2 className="mr-2 size-5 animate-spin text-brand-blue" />
          Memuat data peserta...
        </div>
      ) : studentsList.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-ink-900/10 bg-paper-paper/80 px-6 py-12 text-center text-sm text-ink-600">
          Belum ada peserta terdaftar untuk kursus ini.
        </div>
      ) : (
        <>
          <div className={cn(manageDetailLayout.tableSurface, 'hidden md:block')}>
            <Table className="min-w-[760px] text-left text-sm">
              <TableHeader>
                <TableRow className={manageDetailLayout.tableHeaderRow}>
                  <TableHead className={cn('w-[38%] px-5 py-3', manageDetailLayout.tableHead)}>Nama siswa</TableHead>
                  <TableHead className={cn('w-[18%] px-5 py-3', manageDetailLayout.tableHead)}>
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle className="size-3.5" aria-hidden />
                      Status pendaftaran
                    </span>
                  </TableHead>
                  <TableHead className={cn('w-[22%] px-5 py-3', manageDetailLayout.tableHead)}>
                    <span className="inline-flex items-center gap-1.5">
                      <BarChart3 className="size-3.5" aria-hidden />
                      Kemajuan belajar
                    </span>
                  </TableHead>
                  <TableHead className={cn('w-[22%] px-5 py-3', manageDetailLayout.tableHead)}>
                    <span className="inline-flex items-center gap-1.5">
                      <ClipboardList className="size-3.5" aria-hidden />
                      Kehadiran
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsList.map((student) => (
                  <TableRow key={student.student_uid} className={manageDetailLayout.tableBodyRow}>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {student.student_avatar_url ? (
                          <img src={student.student_avatar_url} width={36} height={36} loading="lazy" alt={student.student_name} className="size-9 rounded-full object-cover ring-1 ring-border/50" />
                        ) : (
                          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">{Initials(student.student_name)}</span>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{student.student_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-medium text-foreground">
                      {adminStatusLabels ? (
                        <AdminParticipantStatusLabel status={student.status} />
                      ) : (
                        <CourseParticipantStatusBadge status={student.status} className="max-w-36" />
                      )}
                    </TableCell>
                    <TableCell className="min-w-44 px-5 py-4">
                      <ProgressBar value={student.progress} />
                    </TableCell>
                    <TableCell className="min-w-44 px-5 py-4">
                      <AttendanceBar student={student} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePaginationFooter
              page={currentPage}
              totalPages={totalPages}
              total={totalCount}
              totalLabel="peserta"
              pageSize={pageSize}
              pageSizeOptions={[5, 10, 25, 50]}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setCurrentPage(1)
              }}
            />
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            <ul className="flex flex-col gap-3">
              {studentsList.map((student) => (
                <li key={student.student_uid} className={cn(manageDetailLayout.sectionCard, 'p-4 shadow-paper')}>
                  <div className="flex items-start gap-3">
                    {student.student_avatar_url ? (
                      <img src={student.student_avatar_url} width={40} height={40} loading="lazy" alt={student.student_name} className="size-10 rounded-full object-cover ring-1 ring-border/50" />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">{Initials(student.student_name)}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{student.student_name}</p>
                      <div className="mt-3 flex flex-col gap-1">
                        <p className={manageDetailLayout.tableHead}>Status pendaftaran</p>
                        {adminStatusLabels ? (
                          <AdminParticipantStatusLabel status={student.status} />
                        ) : (
                          <CourseParticipantStatusBadge status={student.status} className="max-w-36" />
                        )}
                      </div>
                      <div className="mt-3 flex flex-col gap-1">
                        <p className={manageDetailLayout.tableHead}>Kemajuan belajar</p>
                        <ProgressBar value={student.progress} />
                      </div>
                      <div className="mt-3 flex flex-col gap-1">
                        <p className={manageDetailLayout.tableHead}>Kehadiran</p>
                        <AttendanceBar student={student} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className={cn(manageDetailLayout.tableSurface, 'overflow-hidden')}>
              <TablePaginationFooter
                page={currentPage}
                totalPages={totalPages}
                total={totalCount}
                totalLabel="peserta"
                pageSize={pageSize}
                pageSizeOptions={[5, 10, 25, 50]}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
