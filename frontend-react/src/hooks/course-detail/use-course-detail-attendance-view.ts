import { useCallback, useMemo, useState } from 'react'

import { useCourseAttendanceData } from '@/hooks/course-detail/use-course-attendance-data'
import { useCourseDetailLessons } from '@/hooks/course-detail/use-course-detail-lessons'
import { useDeleteLessonAttendance, useUpdateLessonAttendance } from '@/hooks/use-lesson-attendance-mutations'
import type { CourseDetailAttendanceViewModel } from '@/lib/course-detail/course-detail-attendance-view-model'
import type { IMentorCourseStudent } from '@/lib/types/course'
import type { AttendanceStatusValue } from '@/lib/types/features/course-detail-assignments'
import type { IModulesData } from '@/lib/types/course'

type UseCourseDetailAttendanceViewOptions = {
  modules: IModulesData[]
  students: IMentorCourseStudent[]
  enabled?: boolean
}

export function useCourseDetailAttendanceView({
  modules,
  students,
  enabled = true,
}: UseCourseDetailAttendanceViewOptions): CourseDetailAttendanceViewModel {
  const [attendanceLessonUid, setAttendanceLessonUid] = useState('')

  const { lessons, isLoading: lessonsLoading, isError: lessonsError, error: lessonsErrorObj } =
    useCourseDetailLessons(modules, enabled)

  const effectiveLessonUid = attendanceLessonUid || lessons[0]?.uid || null
  const attendanceQuery = useCourseAttendanceData(effectiveLessonUid, enabled && Boolean(effectiveLessonUid))

  const updateAttendanceMutation = useUpdateLessonAttendance(effectiveLessonUid)
  const deleteAttendanceMutation = useDeleteLessonAttendance(effectiveLessonUid)

  const presentCount = useMemo(
    () =>
      (attendanceQuery.data ?? []).filter(
        (record) => record.status === 'present' || record.status === 'late',
      ).length,
    [attendanceQuery.data],
  )

  const onUpdateAttendance = useCallback(
    async (attendanceUid: string, status: AttendanceStatusValue, note?: string) => {
      await updateAttendanceMutation.mutateAsync({
        attendanceUid,
        payload: { status, note },
      })
    },
    [updateAttendanceMutation],
  )

  const onDeleteAttendance = useCallback(
    async (attendanceUid: string) => {
      await deleteAttendanceMutation.mutateAsync(attendanceUid)
    },
    [deleteAttendanceMutation],
  )

  return {
    lessons,
    students,
    selectedLessonUid: effectiveLessonUid ?? '',
    onLessonChange: setAttendanceLessonUid,
    attendances: attendanceQuery.data ?? [],
    isLoading: lessonsLoading || attendanceQuery.isLoading,
    isError: lessonsError || attendanceQuery.isError,
    errorMessage:
      (lessonsErrorObj as Error | undefined)?.message ??
      (attendanceQuery.error as Error | undefined)?.message ??
      null,
    presentCount,
    onUpdateAttendance,
    onDeleteAttendance,
    isMutating: updateAttendanceMutation.isPending || deleteAttendanceMutation.isPending,
  }
}
