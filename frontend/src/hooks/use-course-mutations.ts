import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { courseKeys } from './query-keys'
import type { AssignMentorsToCoursePayload } from '@/lib/course-mentor/types'
import type { CreateCourseReviewReplyPayload } from '@/lib/course-review/types'
import {
  assignMentorsToCourse,
  unassignMentorsFromCourse,
  createCourse,
  deleteCourse,
  replyToCourseReview,
  updateCourse,
  updateCourseStatus,
  type CreateCoursePayload,
  type UpdateCoursePayload,
  type UpdateCourseStatusRequest,
} from '@/services/course'

export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => createCourse(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      toast.success('Kursus dibuat sebagai draf. Terbit lewat tombol Terbit.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal membuat kursus')
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uid, payload }: { uid: string; payload: UpdateCoursePayload }) =>
      updateCourse(uid, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.uid) })
      toast.success('Detail kursus berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui kursus')
    },
  })
}

export function useUpdateCourseStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UpdateCourseStatusRequest) => updateCourseStatus(request),
    onSuccess: (_data, { courseUid }) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) })
      toast.success('Kursus berhasil terbit')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui status kursus')
    },
  })
}

export function useReplyCourseReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      courseUid,
      reviewUid,
      payload,
    }: {
      courseUid: string
      reviewUid: string
      payload: CreateCourseReviewReplyPayload
    }) => replyToCourseReview(courseUid, reviewUid, payload),
    onSuccess: (_data, { courseUid }) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) })
      toast.success('Balasan review berhasil dikirim')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal mengirim balasan review')
    },
  })
}

export function useAssignMentorsToCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      courseUid,
      payload,
    }: {
      courseUid: string
      payload: AssignMentorsToCoursePayload
    }) => assignMentorsToCourse(courseUid, payload),
    onSuccess: (_data, { courseUid }) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) })
      toast.success('Mentor berhasil ditugaskan ke kursus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menugaskan mentor')
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uid: string) => deleteCourse(uid),
    onSuccess: (_data, uid) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      void queryClient.removeQueries({ queryKey: courseKeys.detail(uid) })
      toast.success('Kursus berhasil dinonaktifkan')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal menghapus kursus')
    },
  })
}

export function useUnassignMentorsFromCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      courseUid,
      payload,
    }: {
      courseUid: string
      payload: AssignMentorsToCoursePayload
    }) => unassignMentorsFromCourse(courseUid, payload),
    onSuccess: (_data, { courseUid }) => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all })
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseUid) })
      toast.success('Mentor berhasil dilepas dari kursus')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal melepas mentor')
    },
  })
}
