import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Clock3, Trash2, UserX } from 'lucide-react'

import { CourseDetailSectionHeader } from '@/components/shared/course-detail-manage/CourseDetailSectionHeader'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Initials } from '@/lib/func/func'
import { manageDetailLayout } from '@/lib/course-detail/manage-detail-layout'
import type { CourseDetailAttendanceViewModel } from '@/lib/course-detail/course-detail-attendance-view-model'
import type { AttendanceStatusValue } from '@/lib/types/features/course-detail-assignments'
import { cn } from '@/lib/utils'

type CourseDetailAttendanceTabProps = {
  view: CourseDetailAttendanceViewModel
}

const STATUS_LABEL: Record<AttendanceStatusValue, string> = {
  present: 'Hadir',
  late: 'Terlambat',
  absent: 'Tidak hadir',
  excused: 'Izin',
}

const STATUS_STYLE: Record<AttendanceStatusValue, string> = {
  present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  late: 'bg-amber-50 text-amber-700 border-amber-200',
  absent: 'bg-rose-50 text-rose-700 border-rose-200',
  excused: 'bg-sky-50 text-sky-700 border-sky-200',
}

function AttendanceStatusBadge({ status }: { status: AttendanceStatusValue }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}

export function CourseDetailAttendanceTab({ view }: CourseDetailAttendanceTabProps) {
  const {
    lessons,
    students,
    selectedLessonUid,
    onLessonChange,
    attendances,
    isLoading,
    isError,
    errorMessage,
    presentCount,
    onUpdateAttendance,
    onDeleteAttendance,
    isMutating,
  } = view

  const attendanceByEnrollment = new Map(
    attendances.map((record) => [record.enrollment_uid, record]),
  )

  const rows = students.map((student) => ({
    student,
    attendance: attendanceByEnrollment.get(student.enrollment_uid) ?? null,
  }))

  return (
    <div className={manageDetailLayout.flatPage}>
      <CourseDetailSectionHeader
        title="Kehadiran"
        description="Pilih pertemuan, lalu perbarui status kehadiran peserta yang sudah check-in."
      />

      <dl className={manageDetailLayout.flatStats}>
        <div>
          <dt className={manageDetailLayout.flatStatLabel}>Total peserta</dt>
          <dd className={manageDetailLayout.flatStatValue}>{students.length}</dd>
        </div>
        <div>
          <dt className={manageDetailLayout.flatStatLabel}>Hadir</dt>
          <dd className={manageDetailLayout.flatStatValue}>{presentCount}</dd>
        </div>
        <div>
          <dt className={manageDetailLayout.flatStatLabel}>Tidak hadir</dt>
          <dd className={manageDetailLayout.flatStatValue}>
            {Math.max(students.length - presentCount, 0)}
          </dd>
        </div>
        <div>
          <dt className={manageDetailLayout.flatStatLabel}>Pertemuan</dt>
          <dd className={manageDetailLayout.flatStatValue}>{lessons.length}</dd>
        </div>
      </dl>

      <div className={manageDetailLayout.flatToolbar}>
        <div className="space-y-2">
          <Label htmlFor="attendance-lesson">Pilih pertemuan</Label>
          <Select value={selectedLessonUid} onValueChange={onLessonChange}>
            <SelectTrigger id="attendance-lesson" className="h-10 w-full sm:min-w-[280px]">
              <SelectValue placeholder="Pilih lesson" />
            </SelectTrigger>
            <SelectContent>
              {lessons.map((lesson) => (
                <SelectItem key={lesson.uid} value={lesson.uid}>
                  {lesson.moduleTitle} - {lesson.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <p className={manageDetailLayout.flatError} role="alert">
          {errorMessage ?? 'Gagal memuat data kehadiran.'}
        </p>
      ) : lessons.length === 0 ? (
        <div className={manageDetailLayout.flatEmpty}>
          Belum ada lesson pada kursus ini.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 hover:bg-transparent">
              <TableHead className="h-10 px-0 text-xs font-semibold text-slate-500">Siswa</TableHead>
              <TableHead className="h-10 px-0 text-xs font-semibold text-slate-500">Status</TableHead>
              <TableHead className="h-10 px-0 text-xs font-semibold text-slate-500">
                Waktu check-in
              </TableHead>
              <TableHead className="h-10 px-0 text-xs font-semibold text-slate-500">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ student, attendance }) => (
              <TableRow key={student.enrollment_uid} className="border-slate-200">
                <TableCell className="px-0 py-4">
                  <div className="flex items-center gap-3">
                    {student.student_avatar_url ? (
                      <img
                        src={student.student_avatar_url}
                        alt={student.student_name}
                        className="size-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {Initials(student.student_name)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{student.student_name}</p>
                      <p className="text-xs text-slate-500">
                        Enrollment {student.enrollment_uid.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-0 py-4">
                  {attendance ? (
                    <AttendanceStatusBadge status={attendance.status} />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                      <UserX className="size-3.5" aria-hidden />
                      Belum absen
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-0 py-4 text-sm text-slate-600">
                  {attendance?.checked_in_at ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-3.5 text-slate-400" aria-hidden />
                      {format(new Date(attendance.checked_in_at), 'd MMM yyyy HH:mm', { locale: id })}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="px-0 py-4">
                  {attendance ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={attendance.status}
                        onValueChange={(value) =>
                          void onUpdateAttendance(attendance.uid, value as AttendanceStatusValue)
                        }
                        disabled={isMutating}
                      >
                        <SelectTrigger className="h-9 w-[140px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABEL).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9 text-rose-600 hover:text-rose-700"
                        onClick={() => void onDeleteAttendance(attendance.uid)}
                        disabled={isMutating}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                        Hapus
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Tidak ada catatan</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
