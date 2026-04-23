'use client'

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

type AttendanceItem = Record<string, unknown>

type CreateAttendanceInput = {
  lesson_uid: string
  enrollment_uid: string
  note?: string
}

type UpdateAttendanceInput = {
  status?: string
  note?: string
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useAttendanceCheckStatus(lessonId: string, enrollmentId: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.lessons.attendances.checkStatus(lessonId, enrollmentId),
    queryFn: () =>
      get<Envelope<AttendanceItem>>('/lessons/attendances/check-status', {
        lesson_id: lessonId,
        enrollment_id: enrollmentId,
      }).then((r) => r.data),
  })
}

export function useMyAttendanceHistory(enrollmentId?: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.lessons.attendances.myHistory(enrollmentId),
    queryFn: () =>
      get<Envelope<AttendanceItem[]>>('/lessons/attendances/my-history', {
        enrollment_id: enrollmentId,
      }).then((r) => r.data),
  })
}

export function useAttendanceByUid(uid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.lessons.attendances.byUid(uid),
    queryFn: () => get<Envelope<AttendanceItem>>(`/lessons/attendances/${uid}`).then((r) => r.data),
  })
}

export function useAttendancesByLesson(lessonUid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.lessons.attendances.byLesson(lessonUid),
    queryFn: () => get<Envelope<AttendanceItem[]>>(`/lessons/attendances/lesson/${lessonUid}`).then((r) => r.data),
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateAttendance() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAttendanceInput) =>
      post<Envelope<AttendanceItem>>('/lessons/attendances', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.attendances.all })
    },
  })
}

export function useUpdateAttendance(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateAttendanceInput) =>
      put<Envelope<AttendanceItem>>(`/lessons/attendances/${uid}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.attendances.all })
    },
  })
}

export function useDeleteAttendance(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => del<Envelope<null>>(`/lessons/attendances/${uid}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.attendances.all })
    },
  })
}
