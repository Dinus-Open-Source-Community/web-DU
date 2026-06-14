import { useQuery } from '@tanstack/react-query'

import { attendanceKeys } from '@/hooks/query-keys'
import { fetchLessonAttendances } from '@/services/lesson-attendance'

export function useCourseAttendanceData(lessonUid: string | null, enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.byLesson(lessonUid ?? ''),
    queryFn: () => fetchLessonAttendances(lessonUid!),
    enabled: enabled && Boolean(lessonUid),
    staleTime: 30_000,
  })
}
