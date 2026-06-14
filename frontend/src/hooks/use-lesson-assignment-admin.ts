import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { lessonAssignmentKeys, lessonKeys } from '@/hooks/query-keys'
import { persistAssignment } from '@/lib/course-edit/persist-assignment'
import type { EditableLesson } from '@/lib/course-edit/types'
import {
  deleteLessonAssignment,
  fetchLessonAssignment,
} from '@/services/lesson-assignment-admin'

export function useLessonAssignmentAdmin(lessonUid: string | null, enabled = true) {
  return useQuery({
    queryKey: lessonAssignmentKeys.detail(lessonUid ?? ''),
    queryFn: () => fetchLessonAssignment(lessonUid!),
    enabled: enabled && Boolean(lessonUid),
    staleTime: 30_000,
  })
}

export function useSaveLessonAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      lessonUid,
      lesson,
    }: {
      lessonUid: string
      lesson: EditableLesson
    }) => persistAssignment(lessonUid, lesson),
    onSuccess: async (_result, { lessonUid }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: lessonAssignmentKeys.detail(lessonUid),
        }),
        queryClient.invalidateQueries({
          queryKey: lessonKeys.detail(lessonUid),
        }),
      ])
    },
  })
}

export function useDeleteLessonAssignment(lessonUid: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      if (!lessonUid) throw new Error('Lesson belum disimpan.')
      await deleteLessonAssignment(lessonUid)
    },
    onSuccess: async () => {
      if (!lessonUid) return
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: lessonAssignmentKeys.detail(lessonUid),
        }),
        queryClient.invalidateQueries({
          queryKey: lessonKeys.detail(lessonUid),
        }),
      ])
    },
  })
}
