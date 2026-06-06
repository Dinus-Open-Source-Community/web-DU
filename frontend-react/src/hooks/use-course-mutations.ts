import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { courseKeys } from './query-keys'
import type { AssignMentorsToCoursePayload } from '@/lib/course-mentor/types'
import {
  assignMentorsToCourse,
  createCourse,
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
      toast.success('Kursus dibuat sebagai draf. Terbitkan lewat tombol Update status.')
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
      toast.success('Status kursus berhasil diperbarui')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Gagal memperbarui status kursus')
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
