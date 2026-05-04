'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { put, patch, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

type UpdateLessonInput = {
  title?: string
  content_type?: 'text' | 'video' | 'quiz'
  content?: Record<string, unknown> | string
  video_url?: string
  order_index?: number
}

type UpdateModuleInput = {
  title?: string
  order_index?: number
}

// ─── Mutations for Course Editing ─────────────────────────────────────────────

/**
 * Update a single lesson's content and metadata
 */
export function useUpdateLessonContent(lessonUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateLessonInput) => put<Envelope<Record<string, unknown>>>(`/lessons/${lessonUid}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.all })
      void qc.invalidateQueries({ queryKey: queryKeys.modules.all })
    },
  })
}

/**
 * Update multiple lessons in bulk (for saving all changes at once)
 */
export function useBulkUpdateLessons() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (lessons: Array<{ uid: string; data: UpdateLessonInput }>) => Promise.all(lessons.map((lesson) => put<Envelope<Record<string, unknown>>>(`/lessons/${lesson.uid}`, lesson.data))),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.lessons.all })
      void qc.invalidateQueries({ queryKey: queryKeys.modules.all })
    },
  })
}

/**
 * Publish course (change status)
 */
export function usePublishCourse(courseUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => patch<Envelope<Record<string, unknown>>>(`/courses/${courseUid}/status`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courses.byUid(courseUid) })
      void qc.invalidateQueries({ queryKey: queryKeys.courses.all })
    },
  })
}

/**
 * Update module order
 */
export function useUpdateModuleOrder(moduleUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateModuleInput) => put<Envelope<Record<string, unknown>>>(`/modules/${moduleUid}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.modules.all })
    },
  })
}
