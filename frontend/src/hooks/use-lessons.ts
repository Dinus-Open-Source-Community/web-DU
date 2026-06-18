import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { IQueryParamsPayload } from '@/services/api-path'
import { Message, resolveActionError } from '@/lib/Message'
import {
  createLesson,
  deleteLesson,
  fetchLessonByUid,
  fetchLessonReadingStatus,
  fetchLessonsByModuleUid,
  updateLesson,
  type CreateLessonInput,
  type UpdateLessonInput,
} from '@/services/lessons'
import { lessonKeys, lessonReadingKeys } from './query-keys'

export function useLessonsByModule(moduleUid: string, params?: IQueryParamsPayload) {
  return useQuery({
    queryKey: lessonKeys.byModule(moduleUid, params),
    enabled: !!moduleUid,
    queryFn: () => fetchLessonsByModuleUid(moduleUid, params),
  })
}

export function useLessonByUid(uid: string) {
  return useQuery({
    queryKey: lessonKeys.detail(uid),
    enabled: !!uid,
    queryFn: () => fetchLessonByUid(uid),
  })
}

export function useCreateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateLessonInput) => createLesson(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.all })
      toast.success(Message.lesson.created)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.lesson.createFailed))
    },
  })
}

export function useUpdateLesson(uid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateLessonInput) => updateLesson(uid, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.all })
      void queryClient.invalidateQueries({ queryKey: lessonKeys.detail(uid) })
      toast.success(Message.lesson.updated)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.lesson.updateFailed))
    },
  })
}

export function useDeleteLesson(uid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteLesson(uid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.all })
      void queryClient.invalidateQueries({ queryKey: lessonKeys.detail(uid) })
      toast.success(Message.lesson.deleted)
    },
    onError: (error: Error) => {
      toast.error(resolveActionError(error, Message.lesson.deleteFailed))
    },
  })
}

export function useLessonReadingStatus(uid: string, enabled = true) {
  return useQuery({
    queryKey: lessonReadingKeys.status(uid),
    enabled: !!uid && enabled,
    queryFn: () => fetchLessonReadingStatus(uid),
  })
}
