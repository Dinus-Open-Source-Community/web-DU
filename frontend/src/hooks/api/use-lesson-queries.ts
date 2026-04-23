'use client'

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

type LessonItem = Record<string, unknown>

type LessonListResponse = {
  lessons: LessonItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

type CreateLessonInput = {
  module_uid: string
  title: string
  content_type?: 'text' | 'video'
  content?: string
  video_url?: string
  start_time?: string
  end_time?: string
  order_index?: number
}

type UpdateLessonInput = Partial<Omit<CreateLessonInput, 'module_uid'>>

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useLessons(filters: { page?: number; per_page?: number; module_id?: string; name?: string } = {}) {
  return useSuspenseQuery({
    queryKey: queryKeys.lessons.list(filters),
    queryFn: () =>
      get<Envelope<LessonListResponse>>('/lessons', filters as Record<string, string | number>).then((r) => r.data),
  })
}

export function useLessonByUid(uid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.lessons.byUid(uid),
    queryFn: () => get<Envelope<LessonItem>>(`/lessons/${uid}`).then((r) => r.data),
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateLessonInput) => post<Envelope<LessonItem>>('/lessons', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.all })
      void qc.invalidateQueries({ queryKey: queryKeys.modules.all })
    },
  })
}

export function useUpdateLesson(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateLessonInput) => put<Envelope<LessonItem>>(`/lessons/${uid}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.all })
    },
  })
}

export function useDeleteLesson(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => del<Envelope<null>>(`/lessons/${uid}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.all })
      void qc.invalidateQueries({ queryKey: queryKeys.modules.all })
    },
  })
}
