import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { ClipboardCheck, Clock3, Trash2, UserX } from 'lucide-react'

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
import { cn } from '@/lib/utils'
import type { CourseDetailAttendanceViewModel } from '@/lib/course-detail/course-detail-attendance-view-model'
import type { AttendanceStatusValue } from '@/lib/types/features/course-detail-assignments'
import { AdminAttendanceStatusLabel } from '@/lib/admin/status-label'
import { CourseDetailTabSectionIntro } from '@/components/shared/course-detail-manage/CourseDetailTabSectionIntro'

type CourseDetailAttendanceTabProps = {
  view: CourseDetailAttendanceViewModel
}

const STATUS_LABEL: Record<AttendanceStatusValue, string> = {
  present: 'Hadir',
  late: 'Terlambat',
  absent: 'Tidak hadir',
  excused: 'Izin',
}

function formatLessonOptionLabel(moduleTitle: string, title: string) {
  const module = moduleTitle.trim()
  const lesson = title.trim()
  if (!module) return lesson
  if (!lesson || module === lesson) return module
  if (lesson.startsWith(module)) return lesson
  return `${module} — ${lesson}`
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
    <div className={cn(manageDetailLayout.sectionCard, manageDetailLayout.sectionPadding)}>
      <div className="mb-5 space-y-4">
        <CourseDetailTabSectionIntro
          icon={ClipboardCheck}
          title="Kehadiran siswa"
          description="Lihat dan ubah status absensi peserta untuk setiap pertemuan."
        />
        <div className="w-full min-w-0 space-y-1.5">
          <Label htmlFor="attendance-lesson" className={manageDetailLayout.tableHead}>
            Lesson / pertemuan
          </Label>
          <Select value={selectedLessonUid} onValueChange={onLessonChange} disabled={lessons.length === 0}>
            <SelectTrigger
              id="attendance-lesson"
              className="h-auto min-h-10 w-full max-w-none whitespace-normal text-left [&_[data-slot=select-value]]:line-clamp-none [&_[data-slot=select-value]]:whitespace-normal [&_[data-slot=select-value]]:text-left"
            >
              <SelectValue placeholder={lessons.length === 0 ? 'Belum ada pertemuan' : 'Pilih pertemuan'} />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="max-w-[min(100vw-2rem,42rem)]">
              {lessons.map((lesson) => (
                <SelectItem
                  key={lesson.uid}
                  value={lesson.uid}
                  className="items-start whitespace-normal py-2.5 [&_[data-slot=select-item-text]]:whitespace-normal"
                >
                  {formatLessonOptionLabel(lesson.moduleTitle, lesson.title)}
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
        <p className="text-sm text-destructive" role="alert">
          {errorMessage ?? 'Gagal memuat data kehadiran.'}
        </p>
      ) : lessons.length === 0 ? (
        <div className={manageDetailLayout.flatEmpty}>Belum ada lesson di kurikulum. Tambahkan modul di tab Kurikulum.</div>
      ) : (
        <div className={cn(manageDetailLayout.tableSurface, 'overflow-x-auto')}>
            <Table className="min-w-[720px] text-left text-sm">
              <TableHeader>
                <TableRow className={manageDetailLayout.tableHeaderRow}>
                  <TableHead className={cn('h-10 px-5 py-3', manageDetailLayout.tableHead)}>
                    Nama siswa
                  </TableHead>
                  <TableHead className={cn('h-10 px-5 py-3', manageDetailLayout.tableHead)}>
                    Status kehadiran
                  </TableHead>
                  <TableHead className={cn('h-10 px-5 py-3', manageDetailLayout.tableHead)}>
                    Waktu absen
                  </TableHead>
                  <TableHead className={cn('h-10 px-5 py-3', manageDetailLayout.tableHead)}>
                    Kelola
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ student, attendance }) => (
                  <TableRow key={student.enrollment_uid} className={manageDetailLayout.tableBodyRow}>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {student.student_avatar_url ? (
                          <img
                            src={student.student_avatar_url}
                            alt={student.student_name}
                            className="size-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                            {Initials(student.student_name)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">{student.student_name}</p>
                          <p className="text-xs text-muted-foreground">
                            ID pendaftaran: {student.enrollment_uid.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {attendance ? (
                        <AdminAttendanceStatusLabel status={attendance.status} />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <UserX className="size-3.5" aria-hidden />
                          Belum absen
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-muted-foreground">
                      {attendance?.checked_in_at ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="size-3.5 text-muted-foreground" aria-hidden />
                          {format(new Date(attendance.checked_in_at), 'd MMM yyyy HH:mm', { locale: id })}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">
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
                        <span className="text-xs text-muted-foreground">Belum dicatat</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      )}
    </div>
  )
}
