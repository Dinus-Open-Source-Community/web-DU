import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { IQueryParamsPayload } from '@/services/api-path'
import {
  createLesson,
  deleteLesson,
  fetchLessonByUid,
  fetchLessonReadingStatus,
  fetchLessonsByModuleUid,
  markLessonAsRead,
  updateLesson,
  type CreateLessonInput,
  type UpdateLessonInput,
} from '@/services/lessons'
import { lessonKeys } from './query-keys'

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
      toast.success('Lesson berhasil dibuat')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat lesson')
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
      toast.success('Lesson berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui lesson')
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
      toast.success('Lesson berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus lesson')
    },
  })
}

export function useLessonReadingStatus(uid: string) {
  return useQuery({
    queryKey: lessonKeys.reading(uid),
    enabled: !!uid,
    queryFn: () => fetchLessonReadingStatus(uid),
  })
}

export function useMarkLessonAsRead(uid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markLessonAsRead(uid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: lessonKeys.reading(uid) })
      toast.success('Lesson ditandai sudah dibaca')
    },
    onError: () => {
      toast.error('Gagal menandai lesson sebagai sudah dibaca')
    },
  })
}
