import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { attendanceKeys } from '@/hooks/query-keys'
import type { IUpdateAttendancePayload } from '@/lib/types/features/course-detail-assignments'
import { Message, resolveActionError } from '@/lib/Message'
import { deleteLessonAttendance, updateLessonAttendance } from '@/services/lesson-attendance'

export function useUpdateLessonAttendance(lessonUid: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      attendanceUid,
      payload,
    }: {
      attendanceUid: string
      payload: IUpdateAttendancePayload
    }) => updateLessonAttendance(attendanceUid, payload),
    onSuccess: async () => {
      if (lessonUid) {
        await queryClient.invalidateQueries({ queryKey: attendanceKeys.byLesson(lessonUid) })
      }
      toast.success(Message.attendance.updated)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.attendance.updateFailed))
    },
  })
}

export function useDeleteLessonAttendance(lessonUid: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (attendanceUid: string) => deleteLessonAttendance(attendanceUid),
    onSuccess: async () => {
      if (lessonUid) {
        await queryClient.invalidateQueries({ queryKey: attendanceKeys.byLesson(lessonUid) })
      }
      toast.success(Message.attendance.noteDeleted)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.attendance.noteDeleteFailed))
    },
  })
}
