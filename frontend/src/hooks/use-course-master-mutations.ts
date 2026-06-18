import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { CourseMasterKind } from '@/lib/course-master/types'
import { COURSE_MASTER_LABELS } from '@/lib/course-master/types'
import type {
  CreateCourseMasterPayload,
  UpdateCourseMasterPayload,
} from '@/lib/course-master/types'
import {
  messageCourseMasterAdded,
  messageCourseMasterAddFailed,
  messageCourseMasterDeleted,
  messageCourseMasterDeleteFailed,
  messageCourseMasterUpdated,
  messageCourseMasterUpdateFailed,
  resolveActionError,
} from '@/lib/Message'
import {
  createCourseCategory,
  createCourseType,
  deleteCourseCategory,
  deleteCourseType,
  updateCourseCategory,
  updateCourseType,
} from '@/services/course-master'
import { courseKeys } from './query-keys'

function invalidateCourseMasterQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  kind: CourseMasterKind,
) {
  if (kind === 'category') {
    void queryClient.invalidateQueries({ queryKey: ['course-categories'] })
  } else {
    void queryClient.invalidateQueries({ queryKey: ['course-types'] })
  }

  void queryClient.invalidateQueries({ queryKey: courseKeys.all })
}

export function useCreateCourseMaster(kind: CourseMasterKind) {
  const queryClient = useQueryClient()
  const label = COURSE_MASTER_LABELS[kind].singular

  return useMutation({
    mutationFn: (payload: CreateCourseMasterPayload) =>
      kind === 'category' ? createCourseCategory(payload) : createCourseType(payload),
    onSuccess: () => {
      invalidateCourseMasterQueries(queryClient, kind)
      toast.success(messageCourseMasterAdded(label))
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, messageCourseMasterAddFailed(label)))
    },
  })
}

export function useUpdateCourseMaster(kind: CourseMasterKind) {
  const queryClient = useQueryClient()
  const label = COURSE_MASTER_LABELS[kind].singular

  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: UpdateCourseMasterPayload }) =>
      kind === 'category'
        ? updateCourseCategory(uid, payload)
        : updateCourseType(uid, payload),
    onSuccess: () => {
      invalidateCourseMasterQueries(queryClient, kind)
      toast.success(messageCourseMasterUpdated(label))
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, messageCourseMasterUpdateFailed(label)))
    },
  })
}

export function useDeleteCourseMaster(kind: CourseMasterKind) {
  const queryClient = useQueryClient()
  const label = COURSE_MASTER_LABELS[kind].singular

  return useMutation({
    mutationFn: (uid: string) =>
      kind === 'category' ? deleteCourseCategory(uid) : deleteCourseType(uid),
    onSuccess: () => {
      invalidateCourseMasterQueries(queryClient, kind)
      toast.success(messageCourseMasterDeleted(label))
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, messageCourseMasterDeleteFailed(label)))
    },
  })
}
