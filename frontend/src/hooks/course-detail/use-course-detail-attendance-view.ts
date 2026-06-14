import { useCallback, useMemo, useState } from 'react'

import { useCourseAttendanceData } from '@/hooks/course-detail/use-course-attendance-data'
import { useDeleteLessonAttendance, useUpdateLessonAttendance } from '@/hooks/use-lesson-attendance-mutations'
import { deriveLessonsFromModules } from '@/lib/course-detail/derive-lessons-from-modules'
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

  const lessons = useMemo(
    () => (enabled ? deriveLessonsFromModules(modules) : []),
    [enabled, modules],
  )

  const effectiveLessonUid = attendanceLessonUid || lessons[0]?.uid || null
  const attendanceQuery = useCourseAttendanceData(effectiveLessonUid, enabled && Boolean(effectiveLessonUid))

  const updateAttendanceMutation = useUpdateLessonAttendance(effectiveLessonUid)
  const deleteAttendanceMutation = useDeleteLessonAttendance(effectiveLessonUid)

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
    isLoading: attendanceQuery.isLoading,
    isError: attendanceQuery.isError,
    errorMessage:
      (attendanceQuery.error as Error | undefined)?.message ?? null,
    onUpdateAttendance,
    onDeleteAttendance,
    isMutating: updateAttendanceMutation.isPending || deleteAttendanceMutation.isPending,
  }
}
