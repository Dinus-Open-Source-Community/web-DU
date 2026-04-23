'use client'

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { get, post, put, del, type Envelope } from '@/lib/api/fetcher'
import { queryKeys } from '@/lib/api/query-keys'

type CourseTypeItem = {
  uid: string
  name: string
  description: string
  is_active: boolean
  courses: unknown[]
  created_at: string
  updated_at: string
}

type CourseTypeListResponse = {
  course_types: CourseTypeItem[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

type CreateCourseTypeInput = { name: string; description?: string; is_active?: boolean }
type UpdateCourseTypeInput = { name?: string; description?: string; is_active?: boolean }

export function useCourseTypes(filters: { page?: number; per_page?: number; name?: string } = {}) {
  return useSuspenseQuery({
    queryKey: queryKeys.courseTypes.list(filters),
    queryFn: () =>
      get<Envelope<CourseTypeListResponse>>('/course-types', filters as Record<string, string | number>).then(
        (r) => r.data,
      ),
  })
}

export function useCourseTypeByUid(uid: string) {
  return useSuspenseQuery({
    queryKey: queryKeys.courseTypes.byUid(uid),
    queryFn: () => get<Envelope<CourseTypeItem>>(`/course-types/${uid}`).then((r) => r.data),
  })
}

export function useCreateCourseType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCourseTypeInput) => post<Envelope<CourseTypeItem>>('/course-types', input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courseTypes.all })
    },
  })
}

export function useUpdateCourseType(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCourseTypeInput) => put<Envelope<CourseTypeItem>>(`/course-types/${uid}`, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courseTypes.all })
    },
  })
}

export function useDeleteCourseType(uid: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => del<Envelope<null>>(`/course-types/${uid}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.courseTypes.all })
    },
  })
}
