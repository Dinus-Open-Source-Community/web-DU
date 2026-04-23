'use client'

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

type AssignmentItem = Record<string, unknown>

type UpsertAssignmentInput = {
  title: string
  task_type: string
  deadline_at: string
  status: string
  task_description?: string
  quiz?: unknown
  [key: string]: unknown
}

export function useLessonAssignment(lessonUid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.lessons.assignment(lessonUid),
    queryFn: () => get<Envelope<AssignmentItem>>(`/lessons/${lessonUid}/assignment`).then((r) => r.data),
  })
}

export function useCreateAssignment(lessonUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpsertAssignmentInput) =>
      post<Envelope<AssignmentItem>>(`/lessons/${lessonUid}/assignment`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.assignment(lessonUid) })
    },
  })
}

export function useUpdateAssignment(lessonUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpsertAssignmentInput) =>
      put<Envelope<AssignmentItem>>(`/lessons/${lessonUid}/assignment`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.assignment(lessonUid) })
    },
  })
}

export function useDeleteAssignment(lessonUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => del<Envelope<null>>(`/lessons/${lessonUid}/assignment`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.assignment(lessonUid) })
    },
  })
}
