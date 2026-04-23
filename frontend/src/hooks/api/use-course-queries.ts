'use client'

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, patch, postFormData, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

// ─── Types ───────────────────────────────────────────────────────────────────

type CourseItem = Record<string, unknown>

type CourseListResponse = {
  courses: CourseItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

type CourseStudentsResponse = {
  enrollments: Record<string, unknown>[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

type JoinCourseResponse = {
  enrollment: Record<string, unknown>
  invoice_url: string
}

type CreateReviewInput = { rating: number; comment: string }
type CreateReviewReplyInput = { comment: string }
type AssignMentorsInput = { mentor_uids: string[] }

type CourseListFilters = {
  page?: number
  per_page?: number
  mentor_id?: string
  title?: string
  price?: string
  is_premium?: boolean
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useCourses(filters: CourseListFilters = {}) {
  return useSuspenseQuery({
    queryKey: queryKeys.courses.list(filters),
    queryFn: () =>
      get<Envelope<CourseListResponse>>('/courses', filters as Record<string, string | number | boolean>).then(
        (r) => r.data,
      ),
  })
}

export function useCourseByUid(uid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.courses.byUid(uid),
    queryFn: () => get<Envelope<CourseItem>>(`/courses/${uid}`).then((r) => r.data),
  })
}

export function useCourseStudents(courseUid: string, filters: { page?: number; per_page?: number; name?: string } = {}) {
  return useSuspenseQuery({
    queryKey: queryKeys.courses.students(courseUid, filters),
    queryFn: () =>
      get<Envelope<CourseStudentsResponse>>(`/courses/${courseUid}/students`, filters as Record<string, string | number>).then(
        (r) => r.data,
      ),
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => postFormData<Envelope<CourseItem>>('/courses', formData),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courses.all })
    },
  })
}

export function useJoinCourse(courseUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => post<Envelope<JoinCourseResponse>>(`/courses/${courseUid}/join`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courses.byUid(courseUid) })
      void qc.invalidateQueries({ queryKey: queryKeys.user.self() })
    },
  })
}

export function useCreateCourseReview(courseUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateReviewInput) => post<Envelope<unknown>>(`/courses/${courseUid}/review`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courses.byUid(courseUid) })
    },
  })
}

export function useReplyReview(courseUid: string, reviewUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateReviewReplyInput) =>
      post<Envelope<unknown>>(`/courses/${courseUid}/review/${reviewUid}/reply`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courses.byUid(courseUid) })
    },
  })
}

export function useUpdateCourseStatus(courseUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => patch<Envelope<unknown>>(`/courses/${courseUid}/status`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courses.all })
    },
  })
}

export function useAssignMentors(courseUid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AssignMentorsInput) =>
      post<Envelope<unknown>>(`/courses/${courseUid}/mentors/assign`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courses.byUid(courseUid) })
    },
  })
}
